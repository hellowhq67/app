import 'server-only'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAuth,
  paginatedResponse,
  ReadingAttemptBodySchema,
  getPaginationParams,
} from '@/lib/api'
import {
  getQuestionById,
  createAttempt,
  getAttempts,
  countAttempts,
  checkAiCredits,
} from '@/lib/db/queries'

// Scoring functions ... (keeping duplicated logic local for now)
function scoreMultipleChoiceSingle(userResponse: any, correctAnswer: string) {
  const selected = userResponse.selectedOption
  const isCorrect = selected === correctAnswer
  return { accuracy: isCorrect ? 100 : 0, correctAnswers: isCorrect ? 1 : 0, totalAnswers: 1 }
}

function scoreMultipleChoiceMultiple(userResponse: any, correctAnswers: string[]) {
  const selected = userResponse.selectedOptions || []
  const correctSet = new Set(correctAnswers)
  
  let correctCount = 0
  let incorrectCount = 0
  
  for (const answer of selected) {
    if (correctSet.has(answer)) correctCount++
    else incorrectCount++
  }
  
  // PTE Scoring: +1 for correct, -1 for incorrect, min 0
  const rawScore = correctCount - incorrectCount
  const finalScore = Math.max(0, rawScore)
  const maxScore = correctAnswers.length
  
  return { 
    accuracy: maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0, 
    correctAnswers: finalScore, 
    totalAnswers: maxScore 
  }
}

function scoreReorderParagraphs(userResponse: any, correctOrder: number[]) {
  const userOrder = userResponse.order || []
  // PTE Scoring: 1 point for each correct adjacent pair
  const totalPairs = correctOrder.length - 1
  if (totalPairs <= 0) return { accuracy: 100, correctAnswers: 0, totalAnswers: 0 }

  let correctPairs = 0
  for (let i = 0; i < correctOrder.length - 1; i++) {
    const itemA = correctOrder[i]
    const itemB = correctOrder[i + 1]
    
    // Check if itemA is immediately followed by itemB in userOrder
    const indexA = userOrder.indexOf(itemA)
    if (indexA !== -1 && indexA < userOrder.length - 1) {
      if (userOrder[indexA + 1] === itemB) {
        correctPairs++
      }
    }
  }

  return { 
    accuracy: Math.round((correctPairs / totalPairs) * 100), 
    correctAnswers: correctPairs, 
    totalAnswers: totalPairs 
  }
}

function scoreFillInBlanks(userResponse: any, correctAnswers: any) {
  const userAnswers = userResponse.answers || {}
  const blanks = correctAnswers.blanks || []
  let correctCount = 0
  for (const blank of blanks) {
    const userAnswer = userAnswers[blank.index]?.toLowerCase().trim()
    const correctAnswer = blank.answer.toLowerCase().trim()
    if (userAnswer === correctAnswer) correctCount++
  }
  return { accuracy: Math.round((correctCount / blanks.length) * 100), correctAnswers: correctCount, totalAnswers: blanks.length }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth()

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return apiError(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE')
    }

    const timingCheck = await validateTimingFromRequest(request, { graceMs: 2000 })
    if (!timingCheck.ok) return apiError(timingCheck.status, timingCheck.message, timingCheck.code)

    const json = await request.json()
    const parsed = ReadingAttemptBodySchema.safeParse(json)
    if (!parsed.success) return apiError(400, parsed.error.issues.map((i) => i.message).join('; '), 'BAD_REQUEST')
    const { questionId, type, userResponse, timeTaken } = parsed.data

    const q = await getQuestionById({ id: questionId, category: 'reading' })
    if (!q) return apiError(404, 'Question not found', 'NOT_FOUND')
    if (q.type !== type) return apiError(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    if (q.isActive === false) return apiError(400, 'Question is not active', 'INACTIVE_QUESTION')

    let scores: any
    switch (type) {
      case 'multiple_choice_single': scores = scoreMultipleChoiceSingle(userResponse, q.answerKey as string); break
      case 'multiple_choice_multiple': scores = scoreMultipleChoiceMultiple(userResponse, q.answerKey as string[]); break
      case 'reorder_paragraphs': scores = scoreReorderParagraphs(userResponse, q.answerKey as number[]); break
      case 'fill_in_blanks':
      case 'reading_writing_fill_blanks': scores = scoreFillInBlanks(userResponse, q.answerKey); break
      default: return apiError(400, 'Unsupported question type', 'UNSUPPORTED_TYPE')
    }

    const scoresJson = scores

    const attempt = await createAttempt({
      category: 'reading',
      userId,
      questionId,
      type,
      data: {
        userResponse,
        scores: scoresJson,
        accuracy: scores.accuracy.toString(),
        correctAnswers: scores.correctAnswers,
        totalAnswers: scores.totalAnswers,
        timeTaken,
      }
    })

    return apiSuccess({ attempt, scores: scoresJson }, 201)
  } catch (e) {
    return handleApiError(e, 'POST /api/reading/attempts')
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth()
    const url = new URL(request.url)
    const questionId = url.searchParams.get('questionId') || undefined
    const { page, pageSize } = getPaginationParams(request)

    const [items, total] = await Promise.all([
      getAttempts({
        category: 'reading',
        userId,
        questionId,
        page,
        limit: pageSize,
        includeQuestion: true,
      }),
      countAttempts({
        category: 'reading',
        userId,
        questionId,
      })
    ])

    return paginatedResponse(items, total, page, pageSize)
  } catch (e) {
    return handleApiError(e, 'GET /api/reading/attempts')
  }
}
