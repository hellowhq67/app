'use server'

import { db } from '@/lib/db/drizzle'
import { pteAttempts, pteQuestions, users } from '@/lib/db/schema'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { desc, eq, sql } from 'drizzle-orm'

export type SpeakingType = 'read_aloud' | 'repeat_sentence' | 'describe_image' | 'retell_lecture' | 'answer_short_question'

export async function getAllAttempts(options: {
    page?: number
    limit?: number
    type?: SpeakingType
    sortBy?: 'recent' | 'top_score'
} = {}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const { page = 1, limit = 20, sortBy = 'recent' } = options
    const offset = (page - 1) * limit

    const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(pteAttempts)

    const attempts = await db
        .select({
            id: pteAttempts.id,
            userId: pteAttempts.userId,
            questionId: pteAttempts.questionId,
            audioUrl: pteAttempts.responseAudioUrl, // Mapped from responseAudioUrl
            transcript: pteAttempts.responseText, // Using responseText as transcript
            scores: pteAttempts.aiScores, // Mapped from aiScores
            createdAt: pteAttempts.createdAt,
            // User data
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
            // Question data
            questionTitle: pteQuestions.title,
            questionDifficulty: pteQuestions.difficulty,
        })
        .from(pteAttempts)
        .leftJoin(users, eq(pteAttempts.userId, users.id))
        .leftJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
        .orderBy(
            sortBy === 'top_score'
                ? desc(sql`(${pteAttempts.aiScores}->>'total')::int`)
                : desc(pteAttempts.createdAt)
        )
        .limit(limit)
        .offset(offset)

    return {
        attempts,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
    }
}

export async function getUserPublicAttempts(userId: string, limit: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const attempts = await db
        .select({
            id: pteAttempts.id,
            audioUrl: pteAttempts.responseAudioUrl,
            scores: pteAttempts.aiScores,
            createdAt: pteAttempts.createdAt,
            questionTitle: pteQuestions.title,
            questionDifficulty: pteQuestions.difficulty,
        })
        .from(pteAttempts)
        .leftJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
        .where(eq(pteAttempts.userId, userId))
        .orderBy(desc(pteAttempts.createdAt))
        .limit(limit)

    return attempts
}

export async function getTopAttempts(limit: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const attempts = await db
        .select({
            id: pteAttempts.id,
            userId: pteAttempts.userId,
            audioUrl: pteAttempts.responseAudioUrl,
            scores: pteAttempts.aiScores,
            createdAt: pteAttempts.createdAt,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
            questionTitle: pteQuestions.title,
            questionDifficulty: pteQuestions.difficulty,
        })
        .from(pteAttempts)
        .leftJoin(users, eq(pteAttempts.userId, users.id))
        .leftJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
        .orderBy(desc(sql`(${pteAttempts.aiScores}->>'total')::int`))
        .limit(limit)

    return attempts
}

export async function getCommunityStats() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const [stats] = await db
        .select({
            totalAttempts: sql<number>`COUNT(*)`,
            totalUsers: sql<number>`COUNT(DISTINCT ${pteAttempts.userId})`,
            avgScore: sql<number>`AVG((${pteAttempts.aiScores}->>'total')::int)`,
        })
        .from(pteAttempts)

    return stats
}