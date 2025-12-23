import { NextRequest } from 'next/server'
import {
  apiSuccess,
  apiError,
  handleApiError,
  requireAuth,
} from '@/lib/api'
import { deleteUserExamDate } from '@/lib/db/queries'

/**
 * Deletes a scheduled exam date belonging to the authenticated user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ dateId: string }> }
) {
  try {
    await requireAuth()
    const { dateId } = await params

    const deleted = await deleteUserExamDate(dateId)

    if (!deleted) {
      return apiError(404, 'Exam date not found or unauthorized', 'NOT_FOUND')
    }

    return apiSuccess({ success: true, deleted })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/user/exam-dates/[dateId]')
  }
}