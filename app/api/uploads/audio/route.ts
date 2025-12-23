import { uploadAudio } from '@/lib/actions/upload-actions'
import { apiSuccess, handleApiError, requireAuth } from '@/lib/api'

export async function POST(request: Request) {
    try {
        await requireAuth()
        const formData = await request.formData()
        const blob = await uploadAudio(formData)

        return apiSuccess(blob)
    } catch (e) {
        return handleApiError(e, 'POST /api/uploads/audio')
    }
}
