import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/drizzle'
import { eq } from 'drizzle-orm'
import { pteQuestions, pteListeningQuestions } from '@/lib/db/schema'
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring'
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent'
import {
  scoreMCQSingle,
  scoreMCQMultiple,
  scoreFillBlanks,
  scoreHighlightIncorrectWords,
  scoreWriteFromDictation,
  toAIFeedbackData,
} from '@/lib/ai/deterministic-scoring'
import { QuestionType, AIFeedbackData } from '@/lib/types'
import { z } from 'zod'

export const preferredRegion = 'auto'
export const maxDuration = 60

const listeningSubmissionSchema = z.object({
  questionId: z.string().uuid(),
  type: z.string(),
  submission: z.object({
    // Deterministic question types
    selectedOption: z.string().optional(),
    selectedOptions: z.array(z.string()).optional(),
    filledBlanks: z.record(z.string(), z.string()).optional(),
    highlightedWords: z.array(z.string()).optional(),
    // AI-scored question types
    textAnswer: z.string().optional(),
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
 * POST /api/score/listening
 * Score a listening question submission
 *
 * Listening has both:
 * - Deterministic types: MCQ, Fill Blanks, Highlight Incorrect Words, Select Missing Word, Write from Dictation
 * - AI-scored types: Summarize Spoken Text
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    const body = await req.json()
    const parsed = listeningSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return error(400, `Invalid request: ${parsed.error.message}`, 'BAD_REQUEST')
    }

    const { questionId, type, submission, timeTaken } = parsed.data

    // Fetch question with listening extension
    const question = await db.query.pteQuestions.findFirst({
      where: eq(pteQuestions.id, questionId),
      with: {
        listening: true,
      },
    })

    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    const listeningData = question.listening
    const correctAnswer = question.correctAnswer as {
      correctOption?: string
      correctOptions?: string[]
      correctBlanks?: Record<string, string>
      incorrectWords?: string[]
      correctText?: string
    } | null
    const correctPositions = listeningData?.correctAnswerPositions

    const normalizedType = type.toLowerCase().replace(/-/g, '_')
    let feedback: AIFeedbackData | null = null
    let scoringMethod = 'deterministic'

    // ========================================
    // DETERMINISTIC SCORING TYPES
    // ========================================

    // Highlight Correct Summary / Select Missing Word / MCQ Single
    if (
      normalizedType.includes('highlight_correct') ||
      normalizedType.includes('select_missing') ||
      (normalizedType.includes('single') && normalizedType.includes('mc'))
    ) {
      const userAnswer = submission.selectedOption
      const correctOption = correctAnswer?.correctOption ||
        (correctPositions && listeningData?.options?.choices?.[correctPositions[0]]) ||
        (correctPositions && listeningData?.options?.summaries?.[correctPositions[0]])

      if (userAnswer && correctOption) {
        const result = scoreMCQSingle(userAnswer, correctOption)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // MCQ Multiple
    else if (normalizedType.includes('multiple') && normalizedType.includes('mc')) {
      const userAnswers = submission.selectedOptions
      const correctOptions = correctAnswer?.correctOptions ||
        (correctPositions && listeningData?.options?.choices?.filter((_, i) => correctPositions.includes(i)))

      if (userAnswers && correctOptions && Array.isArray(correctOptions)) {
        const result = scoreMCQMultiple(userAnswers, correctOptions)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // Fill in the Blanks (Listening)
    else if (normalizedType.includes('fill') && normalizedType.includes('blank')) {
      const userBlanks = submission.filledBlanks
      const correctBlanks = correctAnswer?.correctBlanks ||
        (listeningData?.options?.blanks?.reduce((acc, b) => {
          acc[b.position.toString()] = b.answer
          return acc
        }, {} as Record<string, string>))

      if (userBlanks && correctBlanks) {
        const result = scoreFillBlanks(userBlanks, correctBlanks)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // Highlight Incorrect Words
    else if (normalizedType.includes('highlight_incorrect') || normalizedType.includes('hiw')) {
      const userHighlighted = submission.highlightedWords
      const incorrectWords = correctAnswer?.incorrectWords

      if (userHighlighted && incorrectWords && Array.isArray(incorrectWords)) {
        const result = scoreHighlightIncorrectWords(userHighlighted, incorrectWords)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // Write from Dictation (deterministic word matching)
    else if (normalizedType.includes('dictation') || normalizedType.includes('wfd')) {
      const userText = submission.textAnswer
      const correctText = correctAnswer?.correctText || listeningData?.transcript

      if (userText && correctText) {
        const result = scoreWriteFromDictation(userText, correctText)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // ========================================
    // AI-SCORED TYPES (Summarize Spoken Text)
    // ========================================
    else if (normalizedType.includes('summarize_spoken') || normalizedType.includes('sst')) {
      const userText = submission.textAnswer
      if (!userText) {
        return error(400, 'Text answer is required for Summarize Spoken Text', 'MISSING_ANSWER')
      }

      // Validate word count (50-70 words)
      const words = userText.trim().split(/\s+/).filter(Boolean)
      const wordCount = words.length
      const minWords = 50
      const maxWords = 70

      // Get question content
      const questionContent = question.content ||
        listeningData?.questionText ||
        question.title

      // Score using AI
      feedback = await scorePteAttemptV2(type as QuestionType, {
        questionContent,
        submission: { text: userText },
        idealAnswer: listeningData?.transcript || question.sampleAnswer || undefined,
        userId: session.user.id,
        questionId,
      })

      scoringMethod = 'ai-semantic'

      // Add word count validation to feedback
      if (wordCount < minWords || wordCount > maxWords) {
        const message = wordCount < minWords
          ? `Response is too short. Minimum ${minWords} words required, you wrote ${wordCount}.`
          : `Response exceeds maximum word limit. Maximum ${maxWords} words allowed, you wrote ${wordCount}.`

        feedback.areasForImprovement = [
          ...(feedback.areasForImprovement || []),
          message,
        ]

        // Penalize score
        feedback.overallScore = Math.max(10, (feedback.overallScore || 50) - 10)
      }

      feedback.wordCount = wordCount
    }

    if (!feedback) {
      return error(400, 'Unable to score this question type', 'SCORING_FAILED')
    }

    // Save the attempt
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type as QuestionType,
      responseText: submission.textAnswer,
      responseData: {
        selectedOption: submission.selectedOption,
        selectedOptions: submission.selectedOptions,
        filledBlanks: submission.filledBlanks,
        highlightedWords: submission.highlightedWords,
      },
      timeTaken,
      aiFeedback: feedback,
    })

    // Track usage
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: scoringMethod === 'ai-semantic' ? 'google' : 'deterministic',
      model: scoringMethod === 'ai-semantic' ? 'gemini-1.5-pro-latest' : 'rule-based',
      totalTokens: 0,
      cost: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        scoringMethod,
      },
    })
  } catch (e) {
    console.error('[POST /api/score/listening]', e)
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
