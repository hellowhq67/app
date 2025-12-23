import 'server-only'
import { NextResponse } from 'next/server'


export async function GET() {
  const body = {
    ok: true,
    version: '1',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  } as const

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  })
}