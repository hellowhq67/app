import { apiSuccess, handleApiError, requireAuth } from '@/lib/api'
import { getStudyToolsProgress } from '@/lib/db/queries/dashboard'

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth()

    const studyToolsProgress = await getStudyToolsProgress(userId)

    return apiSuccess(studyToolsProgress)
  } catch (e) {
    return handleApiError(e, 'GET /api/dashboard/study-tools-progress')
  }
}