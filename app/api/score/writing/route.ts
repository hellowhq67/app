import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/drizzle'
import { eq } from 'drizzle-orm'
import { pteQuestions, pteWritingQuestions } from '@/lib/db/schema'
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring'
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent'
import { QuestionType, AIFeedbackData } from '@/lib/types'
import { z } from 'zod'

export const preferredRegion = 'auto'
export const maxDuration = 60 // Writing scoring may take longer due to AI

const writingSubmissionSchema = z.object({
  questionId: z.string().uuid(),
  type: z.string(),
  submission: z.object({
    textAnswer: z.string().min(1, 'Text answer is required'),
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
 * Validate word count for writing tasks
 */
function validateWordCount(
  text: string,
  min: number,
  max: number
): { valid: boolean; wordCount: number; message?: string } {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length

  if (wordCount < min) {
    return {
      valid: false,
      wordCount,
      message: `Response is too short. Minimum ${min} words required, you wrote ${wordCount}.`,
    }
  }

  if (wordCount > max) {
    return {
      valid: false,
      wordCount,
      message: `Response exceeds maximum word limit. Maximum ${max} words allowed, you wrote ${wordCount}.`,
    }
  }

  return { valid: true, wordCount }
}

/**
 * POST /api/score/writing
 * Score a writing question submission
 *
 * Writing questions use AI-based scoring with:
 * - Semantic similarity to benchmark responses
 * - Lexical analysis (vocabulary, grammar)
 * - Fluency assessment
 * - Content relevance
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    const body = await req.json()
    const parsed = writingSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return error(400, `Invalid request: ${parsed.error.message}`, 'BAD_REQUEST')
    }

    const { questionId, type, submission, timeTaken } = parsed.data
    const userText = submission.textAnswer

    // Fetch question with writing extension
    const question = await db.query.pteQuestions.findFirst({
      where: eq(pteQuestions.id, questionId),
      with: {
        writing: true,
      },
    })

    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    const writingData = question.writing
    const normalizedType = type.toLowerCase().replace(/-/g, '_')

    // Get word count limits based on question type
    let minWords = 5
    let maxWords = 500

    if (normalizedType.includes('summarize_written_text') || normalizedType.includes('swt')) {
      // Summarize Written Text: 5-75 words, single sentence
      minWords = writingData?.wordCountMin ?? 5
      maxWords = writingData?.wordCountMax ?? 75

      // Check single sentence requirement
      const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length > 1) {
        // Still score but note the issue
        console.log(`[Writing Score] SWT has ${sentences.length} sentences, expected 1`)
      }
    } else if (normalizedType.includes('essay') || normalizedType.includes('write_essay')) {
      // Write Essay: 200-300 words
      minWords = writingData?.wordCountMin ?? 200
      maxWords = writingData?.wordCountMax ?? 300
    } else if (normalizedType.includes('email')) {
      // Write Email: 100-200 words
      minWords = writingData?.wordCountMin ?? 100
      maxWords = writingData?.wordCountMax ?? 200
    }

    // Validate word count (but don't reject - include in feedback)
    const wordValidation = validateWordCount(userText, minWords, maxWords)

    // Get question content for scoring
    const questionContent = question.content ||
      writingData?.promptText ||
      writingData?.passageText ||
      question.title

    // Get ideal/sample answer for reference
    const idealAnswer = question.sampleAnswer ||
      (question.correctAnswer as { text?: string })?.text

    // Score using the AI scoring agent
    const feedback = await scorePteAttemptV2(type as QuestionType, {
      questionContent,
      submission: {
        text: userText,
      },
      idealAnswer,
      userId: session.user.id,
      questionId,
    })

    // Add word count validation to feedback
    const enhancedFeedback: AIFeedbackData = {
      ...feedback,
      wordCount: wordValidation.wordCount,
    }

    if (!wordValidation.valid) {
      enhancedFeedback.areasForImprovement = [
        ...(feedback.areasForImprovement || []),
        wordValidation.message!,
      ]

      // Penalize score for word count violations
      const penalty = normalizedType.includes('summarize') ? 15 : 10
      enhancedFeedback.overallScore = Math.max(10, (feedback.overallScore || 50) - penalty)
    }

    // For Summarize Written Text, check single sentence
    if (normalizedType.includes('summarize')) {
      const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length > 1) {
        enhancedFeedback.areasForImprovement = [
          ...(enhancedFeedback.areasForImprovement || []),
          `Summarize Written Text should be a single sentence. You wrote ${sentences.length} sentences.`,
        ]
        // Additional penalty for multiple sentences
        enhancedFeedback.overallScore = Math.max(10, (enhancedFeedback.overallScore || 50) - 10)
      }
    }

    // Save the attempt
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type as QuestionType,
      responseText: userText,
      responseData: { wordCount: wordValidation.wordCount },
      timeTaken,
      aiFeedback: enhancedFeedback,
    })

    // Track AI usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'google',
      model: 'gemini-1.5-pro-latest',
      totalTokens: 0, // Gemini doesn't provide token counts the same way
      cost: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        feedback: enhancedFeedback,
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        scoringMethod: 'ai-semantic',
        wordCount: wordValidation.wordCount,
        wordLimits: { min: minWords, max: maxWords },
      },
    })
  } catch (e) {
    console.error('[POST /api/score/writing]', e)
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
