import { db } from '../drizzle'
import {
    users,
    userProfiles,
    userProgress,
    userScheduledExamDates,
    speakingAttempts,
    writingAttempts,
    readingAttempts,
    listeningAttempts,
    userSubscriptions
} from '../schema'
import { eq, sql, and } from 'drizzle-orm'

/**
 * Retrieve a user record by ID.
 * Returns core user data (name, email, role, etc).
 */
export async function getUser(userId: string) {
    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)
        return result[0] || null
    } catch (error) {
        console.error('Error in getUser query:', error)
        return null
    }
}

/**
 * Retrieve a user's profile/record.
 * Joins user data with profile data (targetScore, examDate, etc).
 */
export async function getUserProfile(userId: string) {
    try {
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                image: users.image,
                targetScore: userProfiles.targetScore,
                examDate: userProfiles.examDate,
                dailyAiCredits: users.dailyAiCredits,
                aiCreditsUsed: users.aiCreditsUsed,
            })
            .from(users)
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(users.id, userId))
            .limit(1)

        return result[0] || null
    } catch (error) {
        console.error('Error in getUserProfile query:', error)
        return null
    }
}

/**
 * Update a user's core information.
 */
export async function updateUser(userId: string, data: any) {
    const [updatedUser] = await db
        .update(users)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()

    return updatedUser
}

/**
 * Retrieve progress statistics for a user.
 */
export async function getUserProgress(userId: string) {
    try {
        return await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, userId),
        })
    } catch (error) {
        console.error('Error in getUserProgress query:', error)
        return null
    }
}

/**
 * Upsert a user's profile information.
 */
export async function upsertUserProfile(userId: string, data: { examDate?: string | Date | null, targetScore?: string | null }) {
    const { examDate, targetScore } = data
    const formattedDate = examDate ? new Date(examDate) : null

    const existing = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
    })

    if (existing) {
        const [updated] = await db
            .update(userProfiles)
            .set({
                examDate: formattedDate,
                targetScore: targetScore || null,
                updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, userId))
            .returning()
        return updated
    } else {
        const [created] = await db
            .insert(userProfiles)
            .values({
                userId,
                examDate: formattedDate,
                targetScore: targetScore || null,
            })
            .returning()
        return created
    }
}

/**
 * Update a user's progress record.
 */
export async function updateUserProgress(userId: string, data: any) {
    const [updated] = await db
        .insert(userProgress)
        .values({
            userId,
            ...data,
            lastActiveAt: new Date(),
        })
        .onConflictDoUpdate({
            target: userProgress.userId,
            set: {
                ...data,
                lastActiveAt: new Date(),
            },
        })
        .returning()

    return updated
}

/**
 * Upsert a user subscription.
 */
export async function upsertUserSubscription(userId: string, data: any) {
    const existing = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1)

    if (existing.length > 0) {
        const [updated] = await db
            .update(userSubscriptions)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.userId, userId))
            .returning()
        return updated
    } else {
        const [created] = await db
            .insert(userSubscriptions)
            .values({
                userId,
                ...data,
            })
            .returning()
        return created
    }
}

/**
 * Retrieve scheduled exam dates for a user.
 */
export async function getUserExamDates(userId: string) {
    try {
        return await db
            .select()
            .from(userScheduledExamDates)
            .where(eq(userScheduledExamDates.userId, userId))
            .orderBy(userScheduledExamDates.examDate)
    } catch (error) {
        console.error('Error in getUserExamDates query:', error)
        return []
    }
}

/**
 * Create a new scheduled exam date for a user.
 */
export async function createUserExamDate(userId: string, data: { examDate: string | Date, examName?: string, isPrimary?: boolean }) {
    const { examDate, examName, isPrimary } = data
    const date = new Date(examDate)

    if (date < new Date()) {
        throw new Error('Exam date cannot be in the past')
    }

    // If marking as primary, unset other primaries
    if (isPrimary !== false) {
        await db
            .update(userScheduledExamDates)
            .set({ isPrimary: false })
            .where(eq(userScheduledExamDates.userId, userId))
    }

    const [newExamDate] = await db
        .insert(userScheduledExamDates)
        .values({
            userId,
            examDate: date,
            examName: examName || "PTE Academic",
            isPrimary: isPrimary ?? true,
        })
        .returning()

    return newExamDate
}

/**
 * Delete a scheduled exam date for a user.
 */
export async function deleteUserExamDate(userId: string, dateId: string) {
    const [deleted] = await db
        .delete(userScheduledExamDates)
        .where(
            and(
                eq(userScheduledExamDates.id, dateId),
                eq(userScheduledExamDates.userId, userId)
            )
        )
        .returning()

    return deleted || null
}

/**
 * Calculate user progress fallback from all attempt tables.
 */
export async function calculateUserProgressFallback(userId: string) {
    try {
        const [sCount] = await db.select({ count: sql<number>`count(*)` }).from(speakingAttempts).where(eq(speakingAttempts.userId, userId))
        const [wCount] = await db.select({ count: sql<number>`count(*)` }).from(writingAttempts).where(eq(writingAttempts.userId, userId))
        const [rCount] = await db.select({ count: sql<number>`count(*)` }).from(readingAttempts).where(eq(readingAttempts.userId, userId))
        const [lCount] = await db.select({ count: sql<number>`count(*)` }).from(listeningAttempts).where(eq(listeningAttempts.userId, userId))

        const questionsAnswered =
            Number(sCount?.count || 0) +
            Number(wCount?.count || 0) +
            Number(rCount?.count || 0) +
            Number(lCount?.count || 0)

        const [studyTimeResult] = await db
            .select({
                totalDurationMs: sql<number>`coalesce(sum(total_duration_ms), 0)`,
            })
            .from(sql`conversation_sessions`)
            .where(sql`user_id = ${userId}`)

        const totalStudyTimeHours = Math.floor((Number(studyTimeResult?.totalDurationMs) || 0) / (1000 * 60 * 60))

        return {
            questionsAnswered,
            totalStudyTimeHours,
        }
    } catch (error) {
        console.error('Error in calculateUserProgressFallback query:', error)
        return {
            questionsAnswered: 0,
            totalStudyTimeHours: 0,
        }
    }
}
