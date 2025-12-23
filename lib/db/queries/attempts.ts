import { db } from '../drizzle'
import {
    speakingAttempts,
    writingAttempts,
    readingAttempts,
    listeningAttempts,
    speakingQuestions,
    writingQuestions,
    readingQuestions,
    listeningQuestions,
    users
} from '../schema'
import { eq, and, desc, sql, getTableColumns } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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
    category: 'speaking' | 'writing' | 'reading' | 'listening'
    userId: string
    questionId: string
    type: string
    data: any
}) {
    const { category, userId, questionId, type, data } = options

    let table: any
    if (category === 'speaking') table = speakingAttempts
    else if (category === 'writing') table = writingAttempts
    else if (category === 'reading') table = readingAttempts
    else if (category === 'listening') table = listeningAttempts
    else throw new Error('Invalid category')

    const [attempt] = await db
        .insert(table)
        .values({
            userId,
            questionId,
            type,
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
    category: 'speaking' | 'writing' | 'reading' | 'listening'
    userId: string
    questionId?: string
    page?: number
    limit?: number
    includeQuestion?: boolean
}) {
    const { category, userId, questionId, page = 1, limit = 10, includeQuestion = false } = options
    const offset = (page - 1) * limit

    let table: any
    let questionTable: any
    if (category === 'speaking') {
        table = speakingAttempts
        questionTable = speakingQuestions
    } else if (category === 'writing') {
        table = writingAttempts
        questionTable = writingQuestions
    } else if (category === 'reading') {
        table = readingAttempts
        questionTable = readingQuestions
    } else if (category === 'listening') {
        table = listeningAttempts
        questionTable = listeningQuestions
    } else throw new Error('Invalid category')

    const conditions: any[] = [eq(table.userId, userId)]
    if (questionId) conditions.push(eq(table.questionId, questionId))

    const whereExpr = and(...conditions)

    if (includeQuestion && questionTable) {
        return await db
            .select({
                ...getTableColumns(table),
                question: {
                    id: questionTable.id,
                    title: questionTable.title,
                    type: questionTable.type,
                    difficulty: questionTable.difficulty,
                },
            })
            .from(table)
            .innerJoin(questionTable, eq(table.questionId, questionTable.id))
            .where(whereExpr)
            .orderBy(desc(table.createdAt))
            .limit(limit)
            .offset(offset)
    }

    return await db
        .select()
        .from(table)
        .where(whereExpr)
        .orderBy(desc(table.createdAt))
        .limit(limit)
        .offset(offset)
}

/**
 * Count total attempts for a user in a specific category.
 */
export async function countAttempts(options: {
    category: 'speaking' | 'reading' | 'writing' | 'listening'
    userId: string
    questionId?: string
}) {
    const { category, userId, questionId } = options

    let table: any
    if (category === 'speaking') table = speakingAttempts
    else if (category === 'writing') table = writingAttempts
    else if (category === 'reading') table = readingAttempts
    else if (category === 'listening') table = listeningAttempts
    else throw new Error('Invalid category')

    const conditions: any[] = [eq(table.userId, userId)]
    if (questionId) conditions.push(eq(table.questionId, questionId))

    const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(table)
        .where(and(...conditions))

    return Number(result?.count || 0)
}
