import { db } from '@/lib/db/drizzle'
import {
    pteAttempts,
    pteQuestions,
    users
} from '@/lib/db/schema'
import { eq, and, desc, sql, getTableColumns } from 'drizzle-orm'

/**
 * Check if the user has enough AI credits for another attempt.
 */
export async function checkAiCredits(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    })

    if (!user) {
        throw new Error('User not found')
    }

    if (user.aiCreditsUsed >= user.dailyAiCredits) {
        throw new Error('Daily AI credits exhausted. Upgrade to VIP for unlimited scoring.')
    }

    return user
}

/**
 * Create a new attempt record.
 */
export async function createAttempt(options: {
    category?: 'speaking' | 'writing' | 'reading' | 'listening'
    userId: string
    questionId: string
    type?: string
    data: any
}) {
    const { userId, questionId, data } = options

    const [attempt] = await db
        .insert(pteAttempts)
        .values({
            userId,
            questionId,
            ...data,
            createdAt: new Date(),
        })
        .returning()

    // Increment AI credits used
    await db
        .update(users)
        .set({
            aiCreditsUsed: sql`${users.aiCreditsUsed} + 1`,
        })
        .where(eq(users.id, userId))

    return attempt
}

/**
 * Retrieve attempts for the authenticated user based on category and optional filters.
 */
export async function getAttempts(options: {
    category?: 'speaking' | 'writing' | 'reading' | 'listening'
    userId: string
    questionId?: string
    page?: number
    limit?: number
    includeQuestion?: boolean
}) {
    const { userId, questionId, page = 1, limit = 10, includeQuestion = false } = options
    const offset = (page - 1) * limit

    const conditions: any[] = [eq(pteAttempts.userId, userId)]
    if (questionId) conditions.push(eq(pteAttempts.questionId, questionId))

    const whereExpr = and(...conditions)

    if (includeQuestion) {
        return await db
            .select({
                ...getTableColumns(pteAttempts),
                question: {
                    id: pteQuestions.id,
                    title: pteQuestions.title,
                    difficulty: pteQuestions.difficulty,
                },
            })
            .from(pteAttempts)
            .innerJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
            .where(whereExpr)
            .orderBy(desc(pteAttempts.createdAt))
            .limit(limit)
            .offset(offset)
    }

    return await db
        .select()
        .from(pteAttempts)
        .where(whereExpr)
        .orderBy(desc(pteAttempts.createdAt))
        .limit(limit)
        .offset(offset)
}

/**
 * Count total attempts for a user.
 */
export async function countAttempts(options: {
    category?: 'speaking' | 'reading' | 'writing' | 'listening'
    userId: string
    questionId?: string
}) {
    const { userId, questionId } = options

    const conditions: any[] = [eq(pteAttempts.userId, userId)]
    if (questionId) conditions.push(eq(pteAttempts.questionId, questionId))

    const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pteAttempts)
        .where(and(...conditions))

    return Number(result?.count || 0)
}