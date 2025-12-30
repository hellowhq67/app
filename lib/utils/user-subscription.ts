'use server'

import { db } from '@/lib/db/drizzle'
import { subscriptions } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

/**
 * Check if user is a pro member (has active pro or premium subscription)
 */
export async function isProMember(userId?: string): Promise<boolean> {
  try {
    const targetUserId = userId || (await getCurrentUserId())
    if (!targetUserId) return false

    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, targetUserId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.currentPeriodEnd, new Date())
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    })

    return (
      subscription?.tier === 'pro' ||
      subscription?.tier === 'premium' ||
      subscription?.tier === 'unlimited'
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
export async function getUserSubscriptionTier(userId?: string): Promise<'free' | 'pro' | 'premium' | 'unlimited'> {
  try {
    const targetUserId = userId || (await getCurrentUserId())
    if (!targetUserId) return 'free'

    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, targetUserId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.currentPeriodEnd, new Date())
      ),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    })

    if (!subscription) return 'free'

    const tier = subscription.tier?.toLowerCase()
    if (['pro', 'premium', 'unlimited'].includes(tier)) {
      return tier as 'pro' | 'premium' | 'unlimited'
    }

    return 'free'
  } catch (error) {
    console.error('Error getting subscription tier:', error)
    return 'free'
  }
}