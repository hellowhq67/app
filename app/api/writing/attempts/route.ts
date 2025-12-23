import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAuth,
  paginatedResponse,
  WritingAttemptBodySchema,
} from '@/lib/api'
import {
  getQuestionById,
  createAttempt,
  getAttempts,
  countAttempts,
  checkAiCredits,
} from '@/lib/db/queries'
import { basicLengthValidation, countWords } from '@/lib/api'

// Light-weight metrics helpers ... (keeping sentenceCountOf and uniqueWordRatio local for simplicity)
function sentenceCountOf(text: string): number {
  const cleaned = String(text || '').trim()
  if (!cleaned) return 0
  const parts = cleaned.split(/[.!?]+/g).map((s) => s.trim()).filter(Boolean)
  return parts.length
}

function uniqueWordRatio(text: string): number {
  const tokens = String(text || '').toLowerCase().replace(/[^a-zA-Z\u00C0-\u024F']+/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (!tokens.length) return 0
  const uniq = new Set(tokens)
  return uniq.size / tokens.length
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth()

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return apiError(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE')
    }

    const timingCheck = await validateTimingFromRequest(request, { graceMs: 2000 })
    if (!timingCheck.ok) {
      return apiError(timingCheck.status, timingCheck.message, timingCheck.code)
    }

    const json = await request.json()
    const parsed = WritingAttemptBodySchema.safeParse(json)
    if (!parsed.success) {
      return apiError(400, parsed.error.issues.map((i) => i.message).join('; '), 'BAD_REQUEST')
    }
    const { questionId, type, textAnswer, timeTaken } = parsed.data

    await checkAiCredits(userId)

    const q = await getQuestionById({ id: questionId, category: 'writing' })
    if (!q) {
      return apiError(404, 'Question not found', 'NOT_FOUND')
    }
    if (q.type !== type) {
      return apiError(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    }
    if (q.isActive === false) {
      return apiError(400, 'Question is not active', 'INACTIVE_QUESTION')
    }

    const wc = countWords(textAnswer)
    const lengthCheck = basicLengthValidation(type, textAnswer)
    const sc = sentenceCountOf(textAnswer)
    const uwr = uniqueWordRatio(textAnswer)
    const charCount = String(textAnswer || '').length

    let scoresJson: Record<string, unknown> = {
      wordCount: wc,
      sentenceCount: sc,
      length: { min: lengthCheck.min, max: lengthCheck.max, withinRange: lengthCheck.withinRange },
      metrics: { uniqueWordRatio: Number(uwr.toFixed(3)), charCount },
    }

    // Logic for actual AI scoring could be added here
    let total = 0 

    const attempt = await createAttempt({
      category: 'writing',
      userId,
      questionId,
      type,
      data: {
        userResponse: textAnswer,
        scores: scoresJson,
        overallScore: total || null,
        wordCount: wc,
        timeTaken: timeTaken ?? null,
      }
    })

    return apiSuccess({ attempt, scores: scoresJson }, 201)
  } catch (e) {
    return handleApiError(e, 'POST /api/writing/attempts')
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth()
    const url = new URL(request.url)
    const questionId = url.searchParams.get('questionId') || undefined
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get('pageSize') || '25', 10) || 25, 1), 100)

    const [items, total] = await Promise.all([
      getAttempts({
        category: 'writing',
        userId,
        questionId,
        page,
        limit: pageSize,
        includeQuestion: true,
      }),
      countAttempts({
        category: 'writing',
        userId,
        questionId,
      })
    ])

    return apiSuccess({ items, count: total, page, pageSize })
  } catch (e) {
    return handleApiError(e, 'GET /api/writing/attempts')
  }
}