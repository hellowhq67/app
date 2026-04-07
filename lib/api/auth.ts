import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Errors } from './errors'

// Extended user type with admin plugin fields
type SessionUser = {
  id: string
  email: string
  name: string
  role?: string
  banned?: boolean
  banReason?: string
  [key: string]: unknown
}

async function getSession() {
  return auth.api.getSession({
    headers: await headers()
  })
}

export type AuthResult = {
  userId: string
  role: string
}

/**
 * Require authentication - throws if not authenticated or banned
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession()

  if (!session?.user?.id) {
    throw Errors.unauthorized()
  }

  const user = session.user as SessionUser

  if (user.banned) {
    throw Errors.banned(
      user.banReason
        ? `Your account has been suspended: ${user.banReason}`
        : 'Your account has been suspended'
    )
  }

  return {
    userId: user.id,
    role: (user.role as string) ?? 'user',
  }
}

/**
 * Optional auth - returns null if not authenticated
 */
export async function optionalAuth(): Promise<AuthResult | null> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return null

    const user = session.user as SessionUser
    if (user.banned) return null

    return {
      userId: user.id,
      role: (user.role as string) ?? 'user',
    }
  } catch {
    return null
  }
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AuthResult> {
  const authResult = await requireAuth()

  if (authResult.role !== 'admin') {
    throw Errors.forbidden('Admin access required')
  }

  return authResult
}

/**
 * Require teacher role - throws if not teacher or admin
 */
export async function requireTeacher(): Promise<AuthResult> {
  const authResult = await requireAuth()

  if (authResult.role !== 'teacher' && authResult.role !== 'admin') {
    throw Errors.forbidden('Teacher access required')
  }

  return authResult
}
