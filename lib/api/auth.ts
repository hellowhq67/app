import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Errors } from './errors'

async function getSession() {
  return auth.api.getSession({
    headers: await headers()
  })
}

export type AuthResult = {
  userId: string
  role?: string
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession()

  if (!session?.user?.id) {
    throw Errors.unauthorized()
  }

  return {
    userId: session.user.id,
    role: (session.user as any).role,
  }
}

/**
 * Optional auth - returns null if not authenticated
 */
export async function optionalAuth(): Promise<AuthResult | null> {
  try {
    const session = await getSession()
    if (!session?.user?.id) return null

    return {
      userId: session.user.id,
      role: (session.user as any).role,
    }
  } catch {
    return null
  }
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth()

  if (auth.role !== 'admin') {
    throw Errors.forbidden('Admin access required')
  }

  return auth
}
