'use server'

import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema/users';
import { pteMockTests } from '@/lib/db/schema/pte-attempts';
import { eq, sql, count, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { TIER_CONFIGS, SubscriptionTier } from '@/lib/subscription/tiers';

export async function getMockTestAccess() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      remainingAttempts: 0,
      canScore: false,
      tier: 'free',
      dailyLimit: 0,
      isLoggedIn: false
    };
  }

  const userId = session.user.id;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return {
      remainingAttempts: 0,
      canScore: false,
      tier: 'free',
      dailyLimit: 0,
      isLoggedIn: true
    };
  }

  // Check for daily reset
  const now = new Date();
  const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset) : new Date(0);
  const isDifferentDay = now.getDate() !== lastReset.getDate() ||
                         now.getMonth() !== lastReset.getMonth() ||
                         now.getFullYear() !== lastReset.getFullYear();

  if (isDifferentDay) {
    await db.update(users)
      .set({
        aiCreditsUsed: 0,
        lastCreditReset: now,
      })
      .where(eq(users.id, userId));
    user.aiCreditsUsed = 0;
  }

  const tier = (user.subscriptionTier || 'free') as SubscriptionTier;
  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.free;
  
  const dailyLimit = user.dailyAiCredits; 
  const used = user.aiCreditsUsed;
  
  const isUnlimited = config.dailyAiCredits === -1;
  const effectiveLimit = isUnlimited ? 9999 : dailyLimit;
  
  const remainingAttempts = Math.max(0, effectiveLimit - used);

  return {
    remainingAttempts: isUnlimited ? 9999 : remainingAttempts,
    canScore: isUnlimited || remainingAttempts > 0,
    tier,
    dailyLimit: effectiveLimit,
    used,
    isLoggedIn: true
  };
}

export async function getFullMockTestCount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return 0;

  const result = await db.select({ count: count() })
    .from(pteMockTests)
    .where(and(
      eq(pteMockTests.userId, session.user.id),
      eq(pteMockTests.status, 'completed')
    ));

  return result[0]?.count || 0;
}

export async function incrementMockTestUsage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return false;

  const userId = session.user.id;
  
  // Re-check access to be safe
  const access = await getMockTestAccess();
  if (!access.canScore) return false;

  // Increment usage
  await db.update(users)
    .set({
      aiCreditsUsed: sql`${users.aiCreditsUsed} + 1`
    })
    .where(eq(users.id, userId));

  return true;
}

export async function startMockTestSession(testName: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  // Insert new mock test record
  const [newTest] = await db.insert(pteMockTests).values({
    userId: session.user.id,
    testName: testName,
    status: 'in_progress',
    startedAt: new Date(),
    totalQuestions: 20 // Default for full test
  }).returning();

  return newTest;
}

export async function completeMockTestSession(testId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return false;

  await db.update(pteMockTests)
    .set({
      status: 'completed',
      completedAt: new Date()
    })
    .where(and(
      eq(pteMockTests.id, testId),
      eq(pteMockTests.userId, session.user.id)
    ));

  return true;
}