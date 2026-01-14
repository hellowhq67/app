import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/drizzle'
import { eq } from 'drizzle-orm'
import { pteQuestions, pteSpeakingQuestions } from '@/lib/db/schema'
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring'
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent'
import { QuestionType, AIFeedbackData } from '@/lib/types'
import { z } from 'zod'

export const preferredRegion = 'auto'
export const maxDuration = 120 // Speaking may require transcription

const speakingSubmissionSchema = z.object({
  questionId: z.string().uuid(),
  type: z.string(),
  submission: z.object({
    audioRecordingUrl: z.string().url().optional(),
    userTranscript: z.string().optional(), // If client-side transcription is done
    textAnswer: z.string().optional(), // Fallback for testing
  }),
  timeTaken: z.number().int().min(0).optional(),
})

function error(status: number, message: string, code?: string) {
  return NextResponse.json(
    { success: false, error: message, ...(code ? { code } : {}) },
    { status }
  )
}

/**
 * POST /api/score/speaking
 * Score a speaking question submission
 *
 * Speaking questions use AI-based scoring with:
 * - Audio transcription (via AssemblyAI)
 * - Semantic similarity to benchmark responses
 * - Lexical analysis (vocabulary richness)
 * - Fluency assessment (filler words, sentence variance)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    const body = await req.json()
    const parsed = speakingSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return error(400, `Invalid request: ${parsed.error.message}`, 'BAD_REQUEST')
    }

    const { questionId, type, submission, timeTaken } = parsed.data

    // Must have either audio URL or text
    if (!submission.audioRecordingUrl && !submission.userTranscript && !submission.textAnswer) {
      return error(400, 'Audio recording or transcript is required', 'MISSING_SUBMISSION')
    }

    // Fetch question with speaking extension
    const question = await db.query.pteQuestions.findFirst({
      where: eq(pteQuestions.id, questionId),
      with: {
        speaking: true,
      },
    })

    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    const speakingData = question.speaking
    const normalizedType = type.toLowerCase().replace(/-/g, '_')

    // Get question content based on type
    let questionContent = question.content || question.title

    // For Read Aloud, the content IS the passage to read
    if (normalizedType.includes('read_aloud') || normalizedType.includes('ra')) {
      questionContent = question.content || question.title
    }
    // For Repeat Sentence, the expected transcript is the ideal answer
    else if (normalizedType.includes('repeat_sentence') || normalizedType.includes('rs')) {
      questionContent = speakingData?.sampleTranscript || question.content || question.title
    }
    // For Describe Image, the content is the image description prompt
    else if (normalizedType.includes('describe_image') || normalizedType.includes('di')) {
      questionContent = question.content || 'Describe the image in detail.'
    }
    // For Retell Lecture, use key points
    else if (normalizedType.includes('retell_lecture') || normalizedType.includes('rl')) {
      const keyPoints = speakingData?.keyPoints?.join('. ') || ''
      questionContent = keyPoints || question.content || question.title
    }
    // For Answer Short Question
    else if (normalizedType.includes('answer_short') || normalizedType.includes('asq')) {
      questionContent = question.content || question.title
    }

    // Get ideal/sample answer for reference
    const idealAnswer = question.sampleAnswer ||
      speakingData?.sampleTranscript ||
      (question.correctAnswer as { text?: string })?.text

    // Score using the AI scoring agent
    const feedback = await scorePteAttemptV2(type as QuestionType, {
      questionContent,
      submission: {
        text: submission.userTranscript || submission.textAnswer,
        audioUrl: submission.audioRecordingUrl,
      },
      idealAnswer,
      userId: session.user.id,
      questionId,
    })

    // Enhance feedback based on question type
    const enhancedFeedback: AIFeedbackData = { ...feedback }

    // For Read Aloud, check content completeness
    if (normalizedType.includes('read_aloud')) {
      const originalWords = questionContent.toLowerCase().split(/\s+/).filter(Boolean)
      const spokenWords = (feedback.transcript || submission.userTranscript || submission.textAnswer || '')
        .toLowerCase().split(/\s+/).filter(Boolean)

      const matchedWords = originalWords.filter(w => spokenWords.includes(w))
      const contentCoverage = matchedWords.length / originalWords.length

      if (contentCoverage < 0.8) {
        enhancedFeedback.areasForImprovement = [
          ...(feedback.areasForImprovement || []),
          `Read ${Math.round(contentCoverage * 100)}% of the passage. Try to read the entire text clearly.`,
        ]
      }
    }

    // For Repeat Sentence, compare to original
    if (normalizedType.includes('repeat_sentence') && idealAnswer) {
      const idealWords = idealAnswer.toLowerCase().split(/\s+/).filter(Boolean)
      const spokenWords = (feedback.transcript || submission.userTranscript || '')
        .toLowerCase().split(/\s+/).filter(Boolean)

      const correctWords = idealWords.filter((w, i) => spokenWords[i] === w)
      const accuracy = idealWords.length > 0 ? correctWords.length / idealWords.length : 0

      enhancedFeedback.accuracy = {
        score: Math.round(accuracy * 90),
        feedback: `${correctWords.length}/${idealWords.length} words correct`,
      }
    }

    // Save the attempt
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type as QuestionType,
      responseText: feedback.transcript || submission.userTranscript || submission.textAnswer,
      responseAudioUrl: submission.audioRecordingUrl,
      responseData: {
        hasAudio: !!submission.audioRecordingUrl,
        clientTranscript: submission.userTranscript,
      },
      timeTaken,
      aiFeedback: enhancedFeedback,
    })

    // Track AI usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-pro-latest',
      totalTokens: 0,
      cost: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        feedback: enhancedFeedback,
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        scoringMethod: 'ai-semantic',
        transcript: feedback.transcript,
      },
    })
  } catch (e) {
    console.error('[POST /api/score/speaking]', e)
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
