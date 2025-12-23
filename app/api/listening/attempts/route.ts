import 'server-only'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAuth,
  paginatedResponse,
  ListeningAttemptBodySchema,
  textLengthValidation,
  getPaginationParams,
} from '@/lib/api'
import {
  getQuestionById,
  createAttempt,
  getAttempts,
  countAttempts,
  checkAiCredits,
} from '@/lib/db/queries'

// Scoring functions ... (keeping local for simplicity)
function scoreMultipleChoiceSingle(userResponse: any, correctAnswer: string) {
  const selected = userResponse.selectedOption
  const isCorrect = selected === correctAnswer
  return { accuracy: isCorrect ? 100 : 0, correctAnswers: isCorrect ? 1 : 0, totalAnswers: 1 }
}

function scoreMultipleChoiceMultiple(userResponse: any, correctAnswers: string[]) {
  const selected = userResponse.selectedOptions || []
  const correctSet = new Set(correctAnswers)
  let correctCount = 0
  let totalCorrect = correctAnswers.length
  let totalSelected = selected.length
  for (const answer of selected) { if (correctSet.has(answer)) correctCount++ }
  const precision = totalCorrect > 0 ? correctCount / totalCorrect : 0
  const recall = totalSelected > 0 ? correctCount / totalSelected : 0
  const f1Score = precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) : 0
  return { accuracy: Math.round(f1Score * 100), correctAnswers: correctCount, totalAnswers: totalCorrect }
}

function scoreFillInBlanks(userResponse: any, correctAnswers: any) {
  const userAnswers = userResponse.answers || {}
  const blanks = Array.isArray(correctAnswers) ? correctAnswers : correctAnswers.blanks || []
  let correctCount = 0
  for (const blank of blanks) {
    const userAnswer = userAnswers[blank.index]?.toLowerCase().trim()
    const correctAnswer = blank.answer.toLowerCase().trim()
    if (userAnswer === correctAnswer) correctCount++
  }
  return { accuracy: blanks.length > 0 ? Math.round((correctCount / blanks.length) * 100) : 0, correctAnswers: correctCount, totalAnswers: blanks.length }
}

function scoreHighlightIncorrectWords(userResponse: any, correctIndices: number[]) {
  const userIndices = userResponse.indices || []
  const correctSet = new Set(correctIndices)
  let correctCount = 0
  for (const idx of userIndices) { if (correctSet.has(idx)) correctCount++ }
  const precision = correctIndices.length > 0 ? correctCount / correctIndices.length : 0
  const recall = userIndices.length > 0 ? correctCount / userIndices.length : 0
  const f1Score = precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) : 0
  return { accuracy: Math.round(f1Score * 100), correctAnswers: correctCount, totalAnswers: correctIndices.length }
}

function scoreWriteFromDictation(textAnswer: string, transcript: string) {
  const userWords = textAnswer.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const correctWords = transcript.toLowerCase().trim().split(/\s+/).filter(Boolean)
  let correctCount = 0
  const minLength = Math.min(userWords.length, correctWords.length)
  for (let i = 0; i < minLength; i++) { if (userWords[i] === correctWords[i]) correctCount++ }
  return { accuracy: correctWords.length > 0 ? Math.round((correctCount / correctWords.length) * 100) : 0, correctWords: correctCount, totalWords: correctWords.length, wordCount: userWords.length }
}

function scoreSummarizeSpokenText(textAnswer: string) {
  const validation = textLengthValidation('summarize_spoken_text', textAnswer)
  const wc = validation.wordCount
  const withinRange = validation.withinRange
  let score = withinRange ? 75 : 55
  if (wc < 30) score -= 10
  if (wc > 90) score -= 10
  if (wc < 10) score -= 20
  return { wordCount: wc, withinRange, score: Math.max(0, Math.min(90, Math.round(score))) }
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
    const parsed = ListeningAttemptBodySchema.safeParse(json)
    if (!parsed.success) return apiError(400, parsed.error.issues.map((i) => i.message).join('; '), 'BAD_REQUEST')
    const { questionId, type, userResponse, timeTaken } = parsed.data

    await checkAiCredits(userId)

    const q = await getQuestionById({ id: questionId, category: 'listening' })
    if (!q) return apiError(404, 'Question not found', 'NOT_FOUND')
    if (q.type !== type) return apiError(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    if (q.isActive === false) return apiError(400, 'Question is not active', 'INACTIVE_QUESTION')

    let scores: any
    switch (type) {
      case 'multiple_choice_single': {
        const correctAnswer = Array.isArray(q.correctAnswers) ? q.correctAnswers[0] : (q.correctAnswers as any)?.answer || ''
        scores = scoreMultipleChoiceSingle(userResponse, correctAnswer)
        break
      }
      case 'multiple_choice_multiple': {
        const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : (q.correctAnswers as any)?.answers || []
        scores = scoreMultipleChoiceMultiple(userResponse, correctAnswers)
        break
      }
      case 'fill_in_blanks': scores = scoreFillInBlanks(userResponse, q.correctAnswers); break
      case 'highlight_correct_summary':
      case 'select_missing_word': {
        const correctAnswer = Array.isArray(q.correctAnswers) ? q.correctAnswers[0] : (q.correctAnswers as any)?.answer || ''
        scores = scoreMultipleChoiceSingle(userResponse, correctAnswer)
        break
      }
      case 'highlight_incorrect_words': {
        const correctIndices = Array.isArray(q.correctAnswers) ? q.correctAnswers : (q.correctAnswers as any)?.indices || []
        scores = scoreHighlightIncorrectWords(userResponse, correctIndices)
        break
      }
      case 'write_from_dictation': {
        const textAnswer = (userResponse as any).textAnswer || ''
        const transcript = q.transcript || ''
        scores = scoreWriteFromDictation(textAnswer, transcript)
        break
      }
      case 'summarize_spoken_text': {
        const textAnswer = (userResponse as any).textAnswer || ''
        scores = scoreSummarizeSpokenText(textAnswer)
        break
      }
      default: return apiError(400, 'Unsupported question type', 'UNSUPPORTED_TYPE')
    }

    const attempt = await createAttempt({
      category: 'listening',
      userId,
      questionId,
      type,
      data: {
        userResponse,
        scores,
        accuracy: scores.accuracy?.toString() || null,
        correctAnswers: scores.correctAnswers || scores.correctWords || null,
        totalAnswers: scores.totalAnswers || scores.totalWords || null,
        timeTaken: timeTaken ?? null,
      }
    })

    return apiSuccess({ attempt, scores }, 201)
  } catch (e) {
    return handleApiError(e, 'POST /api/listening/attempts')
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth()
    const { page, pageSize } = getPaginationParams(request)
    const url = new URL(request.url)
    const questionId = url.searchParams.get('questionId') || undefined

    const [items, total] = await Promise.all([
      getAttempts({
        category: 'listening',
        userId,
        questionId,
        page,
        limit: pageSize,
        includeQuestion: true,
      }),
      countAttempts({
        category: 'listening',
        userId,
        questionId,
      })
    ])

    return paginatedResponse(items, total, page, pageSize)
  } catch (e) {
    return handleApiError(e, 'GET /api/listening/attempts')
  }
}
