import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { Errors, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { eq } from 'drizzle-orm'

// POST: Ban a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    if (id === admin.userId) {
      throw Errors.badRequest('You cannot ban yourself')
    }

    const body = await request.json()
    const { reason } = body

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id))
    if (existing.length === 0) {
      throw Errors.notFound('User')
    }

    await db
      .update(users)
      .set({ banned: true, banReason: reason || null })
      .where(eq(users.id, id))

    return apiSuccess({ message: 'User banned successfully' })
  } catch (error) {
    return handleApiError(error, 'admin/users/ban:POST')
  }
}

// DELETE: Unban a user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id))
    if (existing.length === 0) {
      throw Errors.notFound('User')
    }

    await db
      .update(users)
      .set({ banned: false, banReason: null })
      .where(eq(users.id, id))

    return apiSuccess({ message: 'User unbanned successfully' })
  } catch (error) {
    return handleApiError(error, 'admin/users/ban:DELETE')
  }
}
