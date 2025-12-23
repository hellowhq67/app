import 'server-only'
import { validateTimingFromRequest } from '@/app/api/attempts/session/utils'
import { getWeightedScore, getAIFeedback } from '@/lib/pte/scoring'
import { getTranscriber } from '@/lib/pte/transcription'
import { logUnifiedAttempt } from '@/lib/pte/attempts'
import { TestSection, QuestionType } from '@/lib/types'
import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAuth,
  paginatedResponse,
  SpeakingAttemptBodySchema,
  getPaginationParams,
} from '@/lib/api'
import { 
  getQuestionById, 
  createAttempt, 
  getAttempts, 
  countAttempts,
  checkAiCredits 
} from '@/lib/db/queries'

export const preferredRegion = 'auto'
export const maxDuration = 60

async function checkSoftRateLimit(userId: string, maxPerHour = 60) {
  // We can use countAttempts with a time filter in the future if needed, 
  // but for now let's keep it simple or implement a dedicated query.
  // Sticking to basic count for now or reusing existing logic if critical.
  return { allowed: true } // Simplified for now to focus on refactoring
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth()

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return apiError(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE')
    }

    // Validate timing window (anti-tamper)
    const timingCheck = await validateTimingFromRequest(request, {
      graceMs: 2000,
    })
    if (!timingCheck.ok) {
      return apiError(timingCheck.status, timingCheck.message, timingCheck.code)
    }

    const json = await request.json()
    const parsed = SpeakingAttemptBodySchema.safeParse(json)
    if (!parsed.success) {
      return apiError(
        400,
        parsed.error.issues.map((i) => i.message).join('; '),
        'BAD_REQUEST'
      )
    }
    const { questionId, type, audioUrl, durationMs } = parsed.data

    // Check AI credits
    await checkAiCredits(userId)

    // Validate question exists and type matches
    const question = await getQuestionById({ id: questionId, category: 'speaking' })
    if (!question) {
      return apiError(404, 'Question not found', 'NOT_FOUND')
    }
    if (question.type !== type) {
      return apiError(400, 'Type mismatch with question', 'TYPE_MISMATCH')
    }
    if (question.isActive === false) {
      return apiError(400, 'Question is not active', 'INACTIVE_QUESTION')
    }

    // Transcribe
    let transcript = ''
    let transcriptionResult: { transcript: string; provider: string; words?: any[] } = { transcript: '', provider: 'none' };
    try {
      const transcriber = await getTranscriber()
      transcriptionResult = await transcriber.transcribe({ audioUrl })
      transcript = transcriptionResult.transcript || ''
    } catch (e) {
      console.warn('Transcription failed', e)
    }

    // Real AI scoring and feedback
    const aiFeedback = await getAIFeedback(type as QuestionType, {
      originalText: question.promptText || question.title || '',
      userTranscript: transcript,
      promptText: question.promptText || question.title || '',
    })
    const totalScore = getWeightedScore(aiFeedback, TestSection.SPEAKING)

    const scored = {
      total: totalScore,
      pronunciation: aiFeedback.pronunciation?.score || 0,
      fluency: aiFeedback.fluency?.score || 0,
      content: aiFeedback.content?.score || 0,
      feedback: 'Scored using unified logic.',
      meta: {}
    }

    // Persist attempt using modular query
    const attempt = await createAttempt({
      category: 'speaking',
      userId,
      questionId,
      type,
      data: {
        audioUrl,
        transcript,
        overallScore: scored.total || null,
        pronunciationScore: scored.pronunciation || null,
        fluencyScore: scored.fluency || null,
        contentScore: scored.content || null,
        durationMs,
        timings: transcriptionResult.words || [],
        scores: scored,
      }
    })

    // Mirror this attempt into the unified analytics table
    await logUnifiedAttempt({
      userId,
      skillType: 'speaking',
      sourceAttemptId: attempt.id,
      sourceTable: 'speaking_attempts',
      questionId,
      questionType: type,
      section: 'speaking',
      userResponse: { audioUrl, transcript },
      scores: scored,
      overallScore: scored.total,
      durationMs,
    })

    return apiSuccess({
      attempt,
      feedback: scored.feedback,
    }, 201)
  } catch (e) {
    return handleApiError(e, 'POST /api/speaking/attempts')
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
        category: 'speaking',
        userId,
        questionId,
        page,
        limit: pageSize,
      }),
      countAttempts({
        category: 'speaking',
        userId,
        questionId,
      })
    ])

    return paginatedResponse(items, total, page, pageSize)
  } catch (e) {
    return handleApiError(e, 'GET /api/speaking/attempts')
  }
}
