'use server'

import { db } from '@/lib/db'
import { userSubscriptions } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Check if user is a pro member (has active pro or premium subscription)
 */
export async function isProMember(userId?: string): Promise<boolean> {
  try {
    const targetUserId = userId || (await getCurrentUserId())
    if (!targetUserId) return false

    const subscription = await db.query.userSubscriptions.findFirst({
      where: and(
        eq(userSubscriptions.userId, targetUserId),
        eq(userSubscriptions.status, 'active'),
        gte(userSubscriptions.endDate, sql`NOW()`)
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    })

    return (
      subscription?.planType === 'pro' ||
      subscription?.planType === 'premium' ||
      subscription?.planType === 'enterprise'
    )
  } catch (error) {
    console.error('Error checking pro membership:', error)
    return false
  }
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session?.user?.id || null
  } catch {
    return null
  }
}

/**
 * Get user subscription tier
 */
export async function getUserSubscriptionTier(userId?: string): Promise<'free' | 'pro' | 'premium'> {
  try {
    const targetUserId = userId || (await getCurrentUserId())
    if (!targetUserId) return 'free'

    const subscription = await db.query.userSubscriptions.findFirst({
      where: and(
        eq(userSubscriptions.userId, targetUserId),
        eq(userSubscriptions.status, 'active'),
        gte(userSubscriptions.endDate, sql`NOW()`)
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    })

    if (!subscription) return 'free'

    const planType = subscription.planType?.toLowerCase()
    if (planType === 'pro' || planType === 'premium' || planType === 'enterprise') {
      return planType === 'premium' || planType === 'enterprise' ? 'premium' : 'pro'
    }

    return 'free'
  } catch (error) {
    console.error('Error getting subscription tier:', error)
    return 'free'
  }
}

