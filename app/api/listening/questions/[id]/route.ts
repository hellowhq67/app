import {
  apiSuccess,
  apiError,
  handleApiError,
} from '@/lib/api'
import { getQuestionById, getQuestionNavigation } from '@/lib/db/queries'
import { ListeningIdParamsSchema } from '../../schemas'

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const params = await ctx.params
    const parsed = ListeningIdParamsSchema.safeParse(params)
    if (!parsed.success) {
      return apiError(400, parsed.error.issues.map((i) => i.message).join('; '), 'BAD_REQUEST')
    }
    const { id } = parsed.data

    const question = await getQuestionById({ id, category: 'listening' })
    if (!question) {
      return apiError(404, 'Question not found', 'NOT_FOUND')
    }

    const nav = await getQuestionNavigation({
      category: 'listening',
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
    return handleApiError(e, 'GET /api/listening/questions/[id]')
  }
}
