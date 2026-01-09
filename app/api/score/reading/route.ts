import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/drizzle'
import { eq } from 'drizzle-orm'
import { pteQuestions, pteReadingQuestions } from '@/lib/db/schema'
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring'
import {
  isDeterministicQuestion,
  scoreDeterministic,
  scoreMCQSingle,
  scoreMCQMultiple,
  scoreReorderParagraphs,
  scoreFillBlanks,
  toAIFeedbackData,
} from '@/lib/ai/deterministic-scoring'
import { QuestionType, AIFeedbackData } from '@/lib/types'
import { z } from 'zod'

export const preferredRegion = 'auto'
export const maxDuration = 30

const readingSubmissionSchema = z.object({
  questionId: z.string().uuid(),
  type: z.string(),
  submission: z.object({
    selectedOption: z.string().optional(),
    selectedOptions: z.array(z.string()).optional(),
    orderedParagraphs: z.array(z.string()).optional(),
    filledBlanks: z.record(z.string(), z.string()).optional(),
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
 * POST /api/score/reading
 * Score a reading question submission
 *
 * Reading questions are deterministic - they have correct answers
 * that can be compared directly without AI evaluation.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return error(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    const body = await req.json()
    const parsed = readingSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return error(400, `Invalid request: ${parsed.error.message}`, 'BAD_REQUEST')
    }

    const { questionId, type, submission, timeTaken } = parsed.data

    // Fetch question with reading extension
    const question = await db.query.pteQuestions.findFirst({
      where: eq(pteQuestions.id, questionId),
      with: {
        reading: true,
      },
    })

    if (!question) {
      return error(404, 'Question not found', 'NOT_FOUND')
    }

    // Get correct answer from question data
    const correctAnswer = question.correctAnswer as {
      correctOption?: string
      correctOptions?: string[]
      correctOrder?: string[]
      correctBlanks?: Record<string, string>
    } | null

    const readingData = question.reading
    const readingCorrect = readingData?.correctAnswerPositions

    if (!correctAnswer && !readingCorrect) {
      return error(400, 'No correct answer defined for this question', 'NO_ANSWER_KEY')
    }

    // Determine the correct answer format based on question type
    let feedback: AIFeedbackData | null = null
    const normalizedType = type.toLowerCase().replace(/-/g, '_')

    // MCQ Single (reading-mc-single)
    if (normalizedType.includes('single') || normalizedType.includes('highlight_correct')) {
      const userAnswer = submission.selectedOption
      const correctOption = correctAnswer?.correctOption ||
        (readingCorrect && readingData?.options?.choices?.[readingCorrect[0]])

      if (userAnswer && correctOption) {
        const result = scoreMCQSingle(userAnswer, correctOption)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // MCQ Multiple (reading-mc-multiple)
    else if (normalizedType.includes('multiple')) {
      const userAnswers = submission.selectedOptions
      const correctOptions = correctAnswer?.correctOptions ||
        (readingCorrect && readingData?.options?.choices?.filter((_, i) => readingCorrect.includes(i)))

      if (userAnswers && correctOptions && Array.isArray(correctOptions)) {
        const result = scoreMCQMultiple(userAnswers, correctOptions)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // Reorder Paragraphs
    else if (normalizedType.includes('reorder')) {
      const userOrder = submission.orderedParagraphs
      const correctOrder = correctAnswer?.correctOrder ||
        readingData?.options?.paragraphs

      if (userOrder && correctOrder && Array.isArray(correctOrder)) {
        const result = scoreReorderParagraphs(userOrder, correctOrder)
        feedback = toAIFeedbackData(result, type)
      }
    }
    // Fill in Blanks (dropdown or drag-drop)
    else if (normalizedType.includes('blank') || normalizedType.includes('fill')) {
      const userBlanks = submission.filledBlanks
      const correctBlanks = correctAnswer?.correctBlanks ||
        (readingData?.options?.blanks?.reduce((acc, b) => {
          acc[b.position.toString()] = b.options[0] // First option is typically correct
          return acc
        }, {} as Record<string, string>))

      if (userBlanks && correctBlanks) {
        const result = scoreFillBlanks(userBlanks, correctBlanks)
        feedback = toAIFeedbackData(result, type)
      }
    }

    // Fallback: use generic deterministic scoring
    if (!feedback) {
      feedback = scoreDeterministic(
        type,
        submission,
        correctAnswer || {}
      )
    }

    if (!feedback) {
      return error(400, 'Unable to score this question type', 'SCORING_FAILED')
    }

    // Save the attempt
    const attempt = await savePteAttempt({
      userId: session.user.id,
      questionId,
      questionType: type as QuestionType,
      responseData: submission,
      timeTaken,
      aiFeedback: feedback,
    })

    // Track usage (no AI tokens used for deterministic scoring)
    await trackAIUsage({
      userId: session.user.id,
      attemptId: attempt.id,
      provider: 'deterministic',
      model: 'rule-based',
      totalTokens: 0,
      cost: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        scoringMethod: 'deterministic',
      },
    })
  } catch (e) {
    console.error('[POST /api/score/reading]', e)
    return error(500, 'Internal Server Error', 'INTERNAL_ERROR')
  }
}
