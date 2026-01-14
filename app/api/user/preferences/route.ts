import { getUserPreferences, upsertUserPreferences } from '@/lib/db/queries'
import { apiSuccess, handleApiError, apiError, requireAuth } from '@/lib/api'

export async function GET() {
  try {
    const { userId } = await requireAuth()
    const preferences = await getUserPreferences(userId)
    return apiSuccess(preferences)
  } catch (error) {
    return handleApiError(error, 'GET /api/user/preferences')
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await requireAuth()
    const body = await req.json()
    
    // Validate required fields
    if (typeof body.emailNotifications !== 'boolean' &&
        typeof body.practiceReminders !== 'boolean' &&
        typeof body.testResults !== 'boolean' &&
        typeof body.marketingEmails !== 'boolean' &&
        !['light', 'dark', 'system'].includes(body.theme)) {
      return apiError(400, 'Invalid preferences data', 'INVALID_DATA')
    }

    const preferences = await upsertUserPreferences(userId, {
      emailNotifications: body.emailNotifications ?? true,
      practiceReminders: body.practiceReminders ?? true,
      testResults: body.testResults ?? true,
      marketingEmails: body.marketingEmails ?? false,
      theme: body.theme ?? 'dark',
    })
    
    return apiSuccess(preferences)
  } catch (error) {
    return handleApiError(error, 'PUT /api/user/preferences')
  }
}
