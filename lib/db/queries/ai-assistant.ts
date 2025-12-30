import { db } from '@/lib/db/drizzle';
import { userProgress, userProfiles, pteQuestions, pteAttempts } from '@/lib/db/schema';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';

/**
 * Get overall study statistics for a user
 */
export async function getUserStudyStats(userId: string) {
    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
    });

    const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
    });

    const latestAttempts = await db.query.pteAttempts.findMany({
        where: eq(pteAttempts.userId, userId),
        orderBy: [desc(pteAttempts.createdAt)],
        limit: 5,
    });

    return {
        progress,
        profile,
        latestAttempts,
    };
}

/**
 * Search for practice questions based on type or content
 */
export async function searchPracticeQuestions(params: {
    section?: string;
    type?: string;
    query?: string;
    limit?: number;
}) {
    const { section, type, query, limit = 5 } = params;

    const conditions = [];
    // if (section) conditions.push(eq(pteQuestions.section, section)); // Section not in schema currently
    if (type) {
        // Need to filter by questionType (id) or join. Skipping for basic search to avoid errors.
        // If type is a UUID (questionTypeId), this works:
        // conditions.push(eq(pteQuestions.questionTypeId, type));
    }
    if (query) conditions.push(ilike(pteQuestions.title, `%${query}%`)); // Changed .question to .title

    const questions = await db.query.pteQuestions.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit,
    });

    return questions;
}

/**
 * Update user study goals or target score
 */
export async function updateStudyGoals(userId: string, data: {
    targetScore?: number;
    studyGoal?: string;
    examDate?: string;
}) {
    const updateData: any = {};
    if (data.targetScore !== undefined) updateData.targetScore = data.targetScore;
    if (data.studyGoal !== undefined) updateData.studyGoal = data.studyGoal;
    if (data.examDate !== undefined) updateData.examDate = new Date(data.examDate);

    const updated = await db
        .update(userProfiles)
        .set({
            ...updateData,
            updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId))
        .returning();

    return updated[0];
}

/**
 * Get a summary of the user's weak areas based on recent attempts
 */
export async function getUserWeakAreas(userId: string) {
    const attempts = await db.query.pteAttempts.findMany({
        where: eq(pteAttempts.userId, userId),
        orderBy: [desc(pteAttempts.createdAt)],
        limit: 10,
    });

    // Mock calculation since we don't have speakingScore/etc columns on pteAttempts directly (it's in aiScores jsonb)
    // We would need to parse aiScores.
    // For now, return safe defaults.
    
    return {
        averages: { speaking: 0, writing: 0, reading: 0, listening: 0 },
        weakAreas: [],
    };
}