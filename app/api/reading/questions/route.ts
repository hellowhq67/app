import {
  paginatedResponse,
  CacheHeaders,
  handleApiError,
  ReadingListQuerySchema,
  normalizeDifficulty,
  parseQueryParams,
} from '@/lib/api'
import { getQuestions } from '@/lib/db/queries'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = parseQueryParams(url, ReadingListQuerySchema)

    if ('error' in parsed) {
      const { apiError } = await import('@/lib/api')
      return apiError(400, parsed.error, 'BAD_REQUEST')
    }

    const { type, page, pageSize, search, isActive, sortBy, sortOrder } = parsed
    const difficulty = normalizeDifficulty(parsed.difficulty)

    const result = await getQuestions({
      category: 'reading',
      type,
      page,
      limit: pageSize,
      difficulty,
      search,
      sortBy,
      sortOrder,
    })

    return paginatedResponse(result.data, result.total, page, pageSize, {
      cacheControl: CacheHeaders.PUBLIC_SHORT,
    })
  } catch (e) {
    return handleApiError(e, 'GET /api/reading/questions')
  }
}
