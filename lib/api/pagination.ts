import { z } from 'zod/v3';
import { sql, asc, desc } from 'drizzle-orm'
import type { PgTableWithColumns, PgColumn } from 'drizzle-orm/pg-core'

/**
 * Pagination utilities for API routes
 */

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationParams = z.infer<typeof PaginationSchema>

export const SortOrderSchema = z.enum(['asc', 'desc']).default('desc')

/**
 * Extract pagination params from request URL
 */
export function getPaginationParams(request: Request): PaginationParams {
  const url = new URL(request.url)
  const result = PaginationSchema.safeParse({
    page: url.searchParams.get('page'),
    pageSize: url.searchParams.get('pageSize'),
  })

  if (!result.success) {
    return { page: 1, pageSize: 20 }
  }

  return result.data
}

/**
 * Calculate offset from pagination params
 */
export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * Get ORDER BY clause from column and direction
 */
export function getSortOrder<T>(column: T, order: 'asc' | 'desc') {
  return order === 'asc' ? asc(column as any) : desc(column as any)
}

/**
 * Count total rows matching conditions
 */
export async function countRows(
  db: any,
  table: any,
  whereExpr?: any
): Promise<number> {
  const query = db.select({ count: sql<number>`count(*)` }).from(table)
  const rows = whereExpr ? await query.where(whereExpr) : await query
  return Number(rows[0]?.count || 0)
}
