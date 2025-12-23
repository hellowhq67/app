import {
  apiSuccess,
  apiError,
  handleApiError,
} from '@/lib/api'
import { getQuestionById, getQuestionNavigation } from '@/lib/db/queries'
import { SpeakingIdParamsSchema } from '../../schemas'

/**
 * GET /api/speaking/questions/[id]
 * Retrieves a single speaking question by ID and its navigation context (prev/next).
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const params = await ctx.params
    const parsed = SpeakingIdParamsSchema.safeParse(params)
    if (!parsed.success) {
      return apiError(400, parsed.error.issues.map((i) => i.message).join('; '), 'BAD_REQUEST')
    }
    const { id } = parsed.data

    const question = await getQuestionById({ id, category: 'speaking' })
    if (!question) {
      return apiError(404, 'Question not found', 'NOT_FOUND')
    }

    const nav = await getQuestionNavigation({
      category: 'speaking',
      currentId: question.id,
      type: question.type,
      createdAt: question.createdAt,
    })

    return apiSuccess({
      question,
      prevId: nav.prevId,
      nextId: nav.nextId,
    }, 200, {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
    })
  } catch (e) {
    return handleApiError(e, 'GET /api/speaking/questions/[id]')
  }
}
