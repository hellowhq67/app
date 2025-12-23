import { getUser, updateUser } from '@/lib/db/queries'
import { apiSuccess, handleApiError, apiError, requireAuth } from '@/lib/api'

export async function GET() {
  try {
    const { userId } = await requireAuth()
    const user = await getUser(userId)
    if (!user) {
      return apiError(404, 'User not found', 'NOT_FOUND')
    }
    return apiSuccess(user)
  } catch (error) {
    return handleApiError(error, 'GET /api/user')
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()
    const updatedUser = await updateUser(userId, body)
    return apiSuccess(updatedUser)
  } catch (error) {
    return handleApiError(error, 'PUT /api/user')
  }
}
