import { db } from '@/lib/db';
import { pteQuestions } from '@/lib/db/schema/pte-questions';
import { users } from '@/lib/db/schema/users';
import { eq, and, sql } from 'drizzle-orm';
import { pteQuestionTypes } from '@/lib/db/schema/pte-categories';

export interface PracticeQuestion {
    id: string;
    title: string;
    content: string | null;
    typeId: string;
    difficulty: string | null;
    isPremium: boolean;
    userStatus?: 'unpracticed' | 'completed' | 'mistake';
    lastScore?: number;
    audioUrl?: string | null;
    imageUrl?: string | null;
    transcript?: string | null;
    sampleAnswer?: string | null;
}

export async function getPracticeQuestions(
    typeIdOrSlug: string,
    page: number = 1,
    limit: number = 20,
    userId?: string
) {
    const offset = (page - 1) * limit;

    let typeId = typeIdOrSlug;
    // Check if it's a UUID (simplistic check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(typeIdOrSlug);

    if (!isUuid) {
        const typeRecord = await db.query.pteQuestionTypes.findFirst({
            where: eq(pteQuestionTypes.code, typeIdOrSlug as any),
            columns: { id: true }
        });

        if (typeRecord) {
            typeId = typeRecord.id;
        } else {
            console.warn(`Question Type Code not found: ${typeIdOrSlug}`);
            return [];
        }
    }

    const questions = await db.select({
        id: pteQuestions.id,
        title: pteQuestions.title,
        content: pteQuestions.content,
        typeId: pteQuestions.questionTypeId,
        difficulty: pteQuestions.difficulty,
        isPremium: pteQuestions.isPremium,
        audioUrl: pteQuestions.audioUrl,
        imageUrl: pteQuestions.imageUrl,
    })
        .from(pteQuestions)
        .where(eq(pteQuestions.questionTypeId, typeId))
        .limit(limit)
        .offset(offset);

    // Todo: Join with user progress table to get status/score

    return questions;
}

export async function getQuestionById(id: string) {
    // Note: We use db.query to take advantage of relations
    const question = await db.query.pteQuestions.findFirst({
        where: eq(pteQuestions.id, id),
        with: {
            questionType: true,
            listening: true,
            speaking: true,
            writing: true,
            reading: true,
        }
    });

    if (!question) return null;

    const { listening, speaking, writing, reading, ...base } = question;

    // Merge extended data, ensuring base properties (like id) take precedence or are handled correctly
    // We explicitly exclude id from extended tables to avoid overwriting the main question id
    // However, since we spread base first, later spreads would overwrite.
    // So we should construct it carefully or rely on spread order if we want extensions to override.
    // Usually extensions add fields. BUT they also have their own IDs.
    // We want the MAIN question ID usually.

    return {
        ...base,
        ...(listening && { ...listening, id: undefined, questionId: undefined }),
        ...(speaking && { ...speaking, id: undefined, questionId: undefined }),
        ...(writing && { ...writing, id: undefined, questionId: undefined }),
        ...(reading && { ...reading, id: undefined, questionId: undefined }),
        id: base.id, // Ensure strict ID preservation
    };
}

export async function getUserPracticeStatus(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            subscriptionTier: true,
            dailyAiCredits: true,
            aiCreditsUsed: true,
        }
    });
    return user;
}
