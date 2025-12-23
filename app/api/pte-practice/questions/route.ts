
import {
  apiSuccess,
  apiError,
  handleApiError,
} from '@/lib/api'
import { getUnifiedQuestions, createUnifiedQuestion } from '@/lib/db/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const section = searchParams.get('section')?.toLowerCase() || undefined
    const type = searchParams.get('type') || searchParams.get('questionType') || undefined
    const difficulty = searchParams.get('difficulty')?.toLowerCase() || undefined
    const search = searchParams.get('search') || undefined

    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100)
    const sort = (searchParams.get('sort') || 'newest').toLowerCase()

    const result = await getUnifiedQuestions({
      section,
      type,
      difficulty,
      search,
      page,
      limit,
      sortOrder: sort === 'oldest' ? 'asc' : 'desc',
    })

    return apiSuccess(result)
  } catch (e) {
    return handleApiError(e, 'GET /api/pte-practice/questions')
  }
}

export async function POST(request: Request) {
  try {
    // In production, enforce admin authorization here.
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return apiError(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE')
    }

    const body = await request.json()
    const {
      question,
      questionType,
      section,
      difficulty = 'medium',
      questionData = null,
      tags = null,
      points = 1,
      orderIndex = 0,
      source = 'local',
      externalId = null,
    } = body || {}

    if (!question || !questionType || !section) {
      return apiError(400, 'Missing required fields: question, questionType, section', 'BAD_REQUEST')
    }

    const created = await createUnifiedQuestion({
      testId: null,
      question,
      questionType,
      section: String(section).toLowerCase(),
      questionData,
      tags,
      difficulty: String(difficulty).toLowerCase(),
      points,
      orderIndex,
      source,
      externalId,
    })

    return apiSuccess(created, 201)
  } catch (e) {
    return handleApiError(e, 'POST /api/pte-practice/questions')
  }
}
