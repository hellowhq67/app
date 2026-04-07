import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { Errors, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { eq } from 'drizzle-orm'

const VALID_ROLES = ['user', 'admin', 'teacher'] as const

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()
    const { role } = body

    if (!role || !VALID_ROLES.includes(role)) {
      throw Errors.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`)
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id))
    if (existing.length === 0) {
      throw Errors.notFound('User')
    }

    await db.update(users).set({ role }).where(eq(users.id, id))

    return apiSuccess({ message: `Role updated to ${role}` })
  } catch (error) {
    return handleApiError(error, 'admin/users/role:PUT')
  }
}
