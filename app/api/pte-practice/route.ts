import { getTests } from '@/lib/db/queries'
import { apiSuccess, handleApiError } from '@/lib/api'

// New standardized route replacing the misspelled /api/ptepratice
// Temporary compatibility: keep the old route until all clients are migrated.
export async function GET() {
  try {
    const tests = await getTests()
    return apiSuccess(tests)
  } catch (e) {
    return handleApiError(e, 'GET /api/pte-practice')
  }
}
