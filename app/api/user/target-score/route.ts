import {
  apiSuccess,
  apiError,
  handleApiError,
} from '@/lib/api'
import { getUserProfile, upsertUserProfile } from '@/lib/db/queries'

/**
 * Retrieve the authenticated user's targetScore.
 */
export async function GET(request: Request) {
  try {
    const profile = await getUserProfile()
    return apiSuccess({ targetScore: profile?.targetScore || null })
  } catch (error) {
    return handleApiError(error, 'GET /api/user/target-score')
  }
}

/**
 * Upsert the authenticated user's target score.
 */
export async function POST(request: Request) {
  try {
    const { targetScore } = await request.json()

    if (
      typeof targetScore !== 'number' ||
      targetScore < 30 ||
      targetScore > 90
    ) {
      return apiError(400, 'Target score must be between 30 and 90', 'VALIDATION_ERROR')
    }

    await upsertUserProfile({ targetScore: targetScore.toString() })

    return apiSuccess({ success: true, targetScore })
  } catch (error) {
    return handleApiError(error, 'POST /api/user/target-score')
  }
}
