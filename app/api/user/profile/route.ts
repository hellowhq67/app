import { getUserProfile, upsertUserProfile } from '@/lib/db/queries'
import { apiSuccess, handleApiError, apiError, requireAuth } from '@/lib/api'

export async function GET() {
  try {
    const { userId } = await requireAuth()
    const profile = await getUserProfile(userId)
    if (!profile) {
      return apiError(404, 'Profile not found', 'NOT_FOUND')
    }
    return apiSuccess(profile)
  } catch (error) {
    return handleApiError(error, 'GET /api/user/profile')
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()
    const profile = await upsertUserProfile(userId, body)
    return apiSuccess(profile)
  } catch (error) {
    return handleApiError(error, 'PATCH /api/user/profile')
  }
}
