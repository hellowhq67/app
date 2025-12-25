import { db } from '@/lib/db/drizzle';
import { userProgress, userProfiles, pteQuestions, testAttempts } from '@/lib/db/schema';
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

    const latestAttempts = await db.query.testAttempts.findMany({
        where: eq(testAttempts.userId, userId),
        orderBy: [desc(testAttempts.createdAt)],
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
    if (section) conditions.push(eq(pteQuestions.section, section));
    if (type) conditions.push(eq(pteQuestions.questionType, type));
    if (query) conditions.push(ilike(pteQuestions.question, `%${query}%`));

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
    // This is a simplified version; in a real app, you'd analyze scores per question type
    const attempts = await db.query.testAttempts.findMany({
        where: eq(testAttempts.userId, userId),
        orderBy: [desc(testAttempts.createdAt)],
        limit: 10,
    });

    // Calculate average scores (mock logic)
    const stats = attempts.reduce((acc: any, curr) => {
        acc.speaking += parseInt(curr.speakingScore || '0');
        acc.writing += parseInt(curr.writingScore || '0');
        acc.reading += parseInt(curr.readingScore || '0');
        acc.listening += parseInt(curr.listeningScore || '0');
        return acc;
    }, { speaking: 0, writing: 0, reading: 0, listening: 0 });

    const count = attempts.length || 1;
    const averages = {
        speaking: stats.speaking / count,
        writing: stats.writing / count,
        reading: stats.reading / count,
        listening: stats.listening / count,
    };

    const weakAreas = Object.entries(averages)
        .sort(([, a], [, b]) => (a as number) - (b as number))
        .slice(0, 2)
        .map(([area]) => area);

    return {
        averages,
        weakAreas,
    };
}
