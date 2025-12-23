import {
  apiSuccess,
  handleApiError,
} from '@/lib/api'
import { getPteCategories } from '@/lib/db/queries'
import { getCached, setCached } from '@/lib/redis'

/**
 * GET /api/pte/categories
 * Retrieves all PTE question categories/types.
 * Uses Redis for caching if available.
 */
export async function GET() {
  try {
    const CACHE_KEY = 'pte:categories'

    // Try cache first
    const cached = await getCached(CACHE_KEY)
    if (cached) {
      return apiSuccess(cached)
    }

    // Fetch from modular query
    const categories = await getPteCategories()

    // Cache the result (1 hour)
    await setCached(CACHE_KEY, categories, 3600)

    return apiSuccess(categories)
  } catch (error) {
    return handleApiError(error, 'GET /api/pte/categories')
  }
}
