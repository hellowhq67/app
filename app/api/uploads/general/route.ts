import { uploadFile } from '@/lib/actions/upload-actions'
import { apiSuccess, handleApiError, requireAuth } from '@/lib/api'

export async function POST(request: Request) {
  try {
    await requireAuth()
    const formData = await request.formData()
    const folder = (formData.get('folder') as string) || 'uploads'
    
    const blob = await uploadFile(formData, folder)

    return apiSuccess(blob)
  } catch (e) {
    return handleApiError(e, 'POST /api/uploads/general')
  }
}
