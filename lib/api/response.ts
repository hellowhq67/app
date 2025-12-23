import { NextResponse } from 'next/server'

/**
 * Standardized API response utilities
 */

export type ApiErrorResponse = {
  error: string
  code?: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * Return a successful JSON response
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Return a standardized error response
 */
export function apiError(
  status: number,
  message: string,
  code?: string
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = { error: message, ...(code && { code }) }
  return NextResponse.json(body, { status })
}

/**
 * Return a paginated response with consistent format
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    { items, total, page, pageSize },
    { status: 200 }
  )
}
