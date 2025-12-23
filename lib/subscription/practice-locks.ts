/**
 * Practice Locks System
 * Manages practice attempt limits for free users
 */

import { sql } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import {
  canPracticeQuestionType,
  getRemainingPracticeAttempts,
  getTierConfig,
} from './tiers'

export interface PracticeLockStatus {
  canPractice: boolean
  attemptsToday: number
  limit: number // -1 for unlimited
  remaining: number // -1 for unlimited
  resetsAt: Date | null
  reason?: string
}

/**
 * Check if user can practice a specific question type
 */
export async function checkPracticeLock(
  userId: string,
  section: string,
  questionType: string,
  subscriptionTier: string = 'free'
): Promise<PracticeLockStatus> {
  const config = getTierConfig(subscriptionTier)
  const limit = config.practiceLimits[section]?.[questionType]

  // Unlimited access
  if (limit === -1 || limit === undefined) {
    return {
      canPractice: true,
      attemptsToday: 0,
      limit: -1,
      remaining: -1,
      resetsAt: null,
    }
  }

  // Get today's attempts
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = await db.execute(sql`
    SELECT
      COALESCE(attempts_today, 0) as attempts_today,
      last_attempt_date
    FROM practice_locks
    WHERE user_id = ${userId}
      AND section = ${section}
      AND question_type = ${questionType}
    LIMIT 1
  `)

  let attemptsToday = 0
  let lastAttemptDate = null

  if (result.length > 0) {
    const row = result[0] as any
    lastAttemptDate = row.last_attempt_date

    // Check if attempts are from today
    const lastDate = new Date(lastAttemptDate)
    lastDate.setHours(0, 0, 0, 0)

    if (lastDate.getTime() === today.getTime()) {
      attemptsToday = parseInt(row.attempts_today as string)
    }
  }

  const canPractice = attemptsToday < limit
  const remaining = Math.max(0, limit - attemptsToday)

  // Calculate when limits reset (midnight local time)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    canPractice,
    attemptsToday,
    limit,
    remaining,
    resetsAt: tomorrow,
    reason: canPractice
      ? undefined
      : `Daily limit reached. You can practice ${limit} times per day. Resets at midnight.`,
  }
}

/**
 * Record a practice attempt
 */
export async function recordPracticeAttempt(
  userId: string,
  section: string,
  questionType: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  await db.execute(sql`
    INSERT INTO practice_locks (user_id, section, question_type, attempts_today, last_attempt_date)
    VALUES (${userId}, ${section}, ${questionType}, 1, ${today})
    ON CONFLICT (user_id, section, question_type)
    DO UPDATE SET
      attempts_today = CASE
        WHEN practice_locks.last_attempt_date = ${today} THEN practice_locks.attempts_today + 1
        ELSE 1
      END,
      last_attempt_date = ${today},
      updated_at = NOW()
  `)
}

/**
 * Get all practice locks for a user (for dashboard display)
 */
export async function getUserPracticeLocks(
  userId: string,
  subscriptionTier: string = 'free'
) {
  const config = getTierConfig(subscriptionTier)
  const locks: Record<string, Record<string, PracticeLockStatus>> = {}

  // For each section and question type, check locks
  for (const [section, questionTypes] of Object.entries(
    config.practiceLimits
  )) {
    locks[section] = {}

    for (const questionType of Object.keys(questionTypes)) {
      locks[section][questionType] = await checkPracticeLock(
        userId,
        section,
        questionType,
        subscriptionTier
      )
    }
  }

  return locks
}

/**
 * Reset all practice locks for a user (admin function)
 */
export async function resetUserPracticeLocks(userId: string): Promise<void> {
  await db.execute(sql`
    DELETE FROM practice_locks
    WHERE user_id = ${userId}
  `)
}

/**
 * Get practice statistics for a user
 */
export async function getPracticeStats(userId: string, days: number = 7) {
  const result = await db.execute(sql`
    SELECT
      section,
      question_type,
      SUM(attempts_today) as total_attempts
    FROM practice_locks
    WHERE user_id = ${userId}
      AND last_attempt_date >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY section, question_type
    ORDER BY total_attempts DESC
  `)

  return result
}

/**
 * Middleware helper to enforce practice locks
 */
export async function withPracticeLock(
  userId: string,
  section: string,
  questionType: string,
  subscriptionTier: string,
  callback: () => Promise<any>
) {
  const lockStatus = await checkPracticeLock(
    userId,
    section,
    questionType,
    subscriptionTier
  )

  if (!lockStatus.canPractice) {
    throw new Error(lockStatus.reason || 'Practice limit reached for today')
  }

  // Record the attempt
  await recordPracticeAttempt(userId, section, questionType)

  // Execute the callback
  return callback()
}

/**
 * Get friendly message about practice lock status
 */
export function getPracticeLockMessage(status: PracticeLockStatus): string {
  if (status.limit === -1) {
    return 'Unlimited practice available'
  }

  if (!status.canPractice) {
    const resetTime = status.resetsAt
      ? new Date(status.resetsAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'tomorrow'
    return `Daily limit reached (${status.attemptsToday}/${status.limit}). Resets at ${resetTime}`
  }

  return `${status.remaining} of ${status.limit} practice attempts remaining today`
}

/**
 * Check if section is locked for free users
 */
export function isSectionLockedForFree(
  section: string,
  questionType: string,
  attemptsToday: number
): boolean {
  const config = getTierConfig('free')
  const limit = config.practiceLimits[section]?.[questionType]

  if (limit === -1 || limit === undefined) {
    return false
  }

  return attemptsToday >= limit
}
