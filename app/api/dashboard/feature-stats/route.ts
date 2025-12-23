import { getBasicStats } from '@/lib/db/queries/dashboard'
import { apiSuccess, handleApiError, requireAuth } from '@/lib/api'

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth()
    const featureStats = await getBasicStats()
    return apiSuccess(featureStats)
  } catch (e) {
    return handleApiError(e, 'GET /api/dashboard/feature-stats')
  }
}