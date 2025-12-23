import { NextRequest } from 'next/server'
import { apiSuccess, apiError, handleApiError } from '@/lib/api'

// Moved helper to module scope or keep here
async function searchMXBAI(query: string) {
  const key = process.env.MXBAI_API_KEY
  const store = process.env.MXBAI_STORE_ID
  if (!key || !store) return []
  try {
    const res = await fetch(`https://api.mxbai.com/v1/stores/${store}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, top_k: 8 }),
    })
    const data = await res.json()
    const items = Array.isArray(data?.results) ? data.results : []
    return items.map((i: any) => ({
      title: i.title || i.text || 'Result',
      url: i.url || '/',
      source: 'mxbai',
    }))
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('query') || ''
    if (!q.trim()) return apiSuccess({ results: [] })
    const ai = await searchMXBAI(q)
    return apiSuccess({ results: ai })
  } catch (e) {
    return handleApiError(e, 'GET /api/search')
  }
}
