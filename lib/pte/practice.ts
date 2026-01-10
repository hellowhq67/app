import { db } from '@/lib/db';
import { pteQuestions } from '@/lib/db/schema/pte-questions';
import { pteAttempts } from '@/lib/db/schema/pte-attempts';
import { users } from '@/lib/db/schema/users';
import { userProgress, userProfiles } from '@/lib/db/schema/user-progress';
import { eq, and, sql, desc, inArray, avg, count } from 'drizzle-orm';
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

    // Fetch user progress if userId is provided
    let questionsWithStatus = questions.map(q => ({
        ...q,
        userStatus: 'unpracticed' as 'unpracticed' | 'completed' | 'mistake',
        lastScore: undefined as number | undefined
    }));

    if (userId && questions.length > 0) {
        const questionIds = questions.map(q => q.id);

        const attempts = await db.select({
            questionId: pteAttempts.questionId,
            aiScore: pteAttempts.aiScore,
            status: pteAttempts.status,
            createdAt: pteAttempts.createdAt,
        })
            .from(pteAttempts)
            .where(
                and(
                    eq(pteAttempts.userId, userId),
                    inArray(pteAttempts.questionId, questionIds)
                )
            )
            .orderBy(desc(pteAttempts.createdAt));

        // Create a map of latest attempts
        const attemptMap = new Map();
        attempts.forEach(attempt => {
            if (!attemptMap.has(attempt.questionId)) {
                attemptMap.set(attempt.questionId, attempt);
            }
        });

        questionsWithStatus = questionsWithStatus.map(q => {
            const attempt = attemptMap.get(q.id);
            if (attempt) {
                return {
                    ...q,
                    userStatus: 'completed', // Assuming any attempt means completed/practiced
                    lastScore: attempt.aiScore ?? undefined
                };
            }
            return q;
        });
    }

    return questionsWithStatus;
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

/**
 * Update user progress after completing a question attempt
 */
export async function updateUserProgress(
    userId: string,
    questionId: string,
    score: number,
    section?: 'speaking' | 'writing' | 'reading' | 'listening'
) {
    // First, get or create user progress record
    let progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
    });

    if (!progress) {
        const [newProgress] = await db.insert(userProgress).values({
            userId,
            questionsAnswered: 1,
            lastActiveAt: new Date(),
        }).returning();
        progress = newProgress;
    }

    // Update progress based on section
    const updates: Record<string, any> = {
        questionsAnswered: sql`${userProgress.questionsAnswered} + 1`,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
    };

    // Update section-specific score (rolling average)
    if (section) {
        const scoreField = `${section}Score` as keyof typeof userProgress;
        const currentScore = progress[scoreField] as number || 0;
        const questionsAnswered = progress.questionsAnswered || 0;

        // Calculate new rolling average
        const newScore = questionsAnswered > 0
            ? Math.round((currentScore * questionsAnswered + score) / (questionsAnswered + 1))
            : score;

        if (section === 'speaking') {
            updates.speakingScore = newScore;
        } else if (section === 'writing') {
            updates.writingScore = newScore;
        } else if (section === 'reading') {
            updates.readingScore = newScore;
        } else if (section === 'listening') {
            updates.listeningScore = newScore;
        }
    }

    await db.update(userProgress)
        .set(updates)
        .where(eq(userProgress.userId, userId));

    // Also update practice count in user profiles
    if (section) {
        const countField = `${section}PracticeCount`;
        await db.update(userProfiles)
            .set({
                [countField]: sql`COALESCE(${userProfiles[`${section}PracticeCount` as keyof typeof userProfiles]}, 0) + 1`,
                updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, userId));
    }
}

/**
 * Get user's attempt history for a specific question
 */
export async function getUserQuestionHistory(userId: string, questionId: string) {
    const attempts = await db.select({
        id: pteAttempts.id,
        score: pteAttempts.aiScore,
        status: pteAttempts.status,
        attemptNumber: pteAttempts.attemptNumber,
        timeTaken: pteAttempts.timeTaken,
        createdAt: pteAttempts.createdAt,
        responseText: pteAttempts.responseText,
    })
        .from(pteAttempts)
        .where(
            and(
                eq(pteAttempts.userId, userId),
                eq(pteAttempts.questionId, questionId)
            )
        )
        .orderBy(desc(pteAttempts.createdAt));

    return {
        totalAttempts: attempts.length,
        bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : null,
        averageScore: attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
            : null,
        lastAttempt: attempts[0] || null,
        attempts,
    };
}

/**
 * Get mastery level for a question type based on user's performance
 * Returns: 'novice' | 'developing' | 'proficient' | 'mastered'
 */
export async function getMasteryLevel(userId: string, questionTypeId: string) {
    // Get all questions of this type that user has attempted
    const questions = await db.select({ id: pteQuestions.id })
        .from(pteQuestions)
        .where(eq(pteQuestions.questionTypeId, questionTypeId));

    if (questions.length === 0) {
        return { level: 'novice', score: 0, attempted: 0, total: 0 };
    }

    const questionIds = questions.map(q => q.id);

    // Get average score across all attempts for this question type
    const [result] = await db.select({
        avgScore: avg(pteAttempts.aiScore),
        attemptCount: count(pteAttempts.id),
    })
        .from(pteAttempts)
        .where(
            and(
                eq(pteAttempts.userId, userId),
                inArray(pteAttempts.questionId, questionIds)
            )
        );

    const avgScore = Number(result.avgScore) || 0;
    const attemptCount = Number(result.attemptCount) || 0;

    // Determine mastery level based on average score
    let level: 'novice' | 'developing' | 'proficient' | 'mastered';
    if (avgScore >= 75 && attemptCount >= 5) {
        level = 'mastered';
    } else if (avgScore >= 60 && attemptCount >= 3) {
        level = 'proficient';
    } else if (avgScore >= 40 && attemptCount >= 1) {
        level = 'developing';
    } else {
        level = 'novice';
    }

    return {
        level,
        score: Math.round(avgScore),
        attempted: attemptCount,
        total: questions.length,
    };
}

/**
 * Get dashboard summary stats for a user
 */
export async function getUserDashboardStats(userId: string) {
    // Get user progress
    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
    });

    // Get user profile for target score
    const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
    });

    // Get recent attempts
    const recentAttempts = await db.select({
        id: pteAttempts.id,
        score: pteAttempts.aiScore,
        createdAt: pteAttempts.createdAt,
        questionTitle: pteQuestions.title,
    })
        .from(pteAttempts)
        .innerJoin(pteQuestions, eq(pteAttempts.questionId, pteQuestions.id))
        .where(eq(pteAttempts.userId, userId))
        .orderBy(desc(pteAttempts.createdAt))
        .limit(5);

    // Calculate overall average from section scores
    const sectionScores = [
        progress?.speakingScore || 0,
        progress?.writingScore || 0,
        progress?.readingScore || 0,
        progress?.listeningScore || 0,
    ].filter(s => s > 0);

    const overallAverage = sectionScores.length > 0
        ? Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length)
        : 0;

    return {
        overallScore: overallAverage,
        targetScore: profile?.targetScore || 65,
        examDate: profile?.examDate,
        studyStreak: progress?.studyStreak || 0,
        totalQuestions: progress?.questionsAnswered || 0,
        testsCompleted: progress?.testsCompleted || 0,
        sectionScores: {
            speaking: progress?.speakingScore || 0,
            writing: progress?.writingScore || 0,
            reading: progress?.readingScore || 0,
            listening: progress?.listeningScore || 0,
        },
        recentAttempts: recentAttempts.map(a => ({
            id: a.id,
            score: a.score,
            questionTitle: a.questionTitle,
            date: a.createdAt,
        })),
    };
}
