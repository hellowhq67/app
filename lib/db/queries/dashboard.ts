import { db } from '../drizzle'
import { users, pteTests, pteQuestions, pteAttempts, userProgress, testAttempts } from '../schema'
import { count, eq, sql } from 'drizzle-orm'

/**
 * Get basic statistics for the dashboard
 */
export async function getBasicStats() {
    try {
        const [userCount] = await db.select({ value: count() }).from(users)
        const [testCount] = await db.select({ value: count() }).from(pteTests)
        const [questionCount] = await db.select({ value: count() }).from(pteQuestions)
        const [attemptCount] = await db.select({ value: count() }).from(pteAttempts)

        return {
            users: userCount.value,
            tests: testCount.value,
            questions: questionCount.value,
            attempts: attemptCount.value,
        }
    } catch (error) {
        console.error('Error in getBasicStats:', error)
        throw error
    }
}

/**
 * Get study tools progress for a specific user
 */
export async function getStudyToolsProgress(userId: string) {
    try {
        const progress = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, userId),
        })

        if (!progress) {
            return {
                vocabBooks: { progress: 0, learnedWords: 0, totalWords: 5000 },
                shadowing: { progress: 0, completedHours: 0, totalHours: 50 },
                mp3Files: { progress: 0, listenedFiles: 0, totalFiles: 1000 },
                overall: { averageProgress: 0, totalTimeSpent: 0, currentStreak: 0 }
            }
        }

        // Mapping real data to the expected dashboard structure
        // This is a simplified mapping based on available fields
        return {
            vocabBooks: {
                totalWords: 5000, // Hardcoded for now or fetched from somewhere
                learnedWords: progress.questionsAnswered || 0,
                progress: Math.min(100, Math.round(((progress.questionsAnswered || 0) / 5000) * 100)),
                lastStudied: progress.lastActiveAt?.toISOString(),
                streak: progress.studyStreak || 0,
                timeSpent: progress.totalStudyTime || 0,
            },
            shadowing: {
                totalHours: 50,
                completedHours: Math.round((progress.totalStudyTime || 0) / 60),
                progress: Math.min(100, Math.round(((progress.totalStudyTime || 0) / (50 * 60)) * 100)),
                lastSession: progress.lastActiveAt?.toISOString(),
                streak: progress.studyStreak || 0,
                timeSpent: progress.totalStudyTime || 0,
            },
            mp3Files: {
                totalFiles: 1000,
                listenedFiles: Math.round((progress.testsCompleted || 0) * 5), // Mock mapping: 5 files per test
                progress: Math.min(100, Math.round(((progress.testsCompleted || 0) * 5 / 1000) * 100)),
                lastListened: progress.lastActiveAt?.toISOString(),
                favoriteCategory: 'General Academics',
                timeSpent: progress.totalStudyTime || 0,
            },
            overall: {
                totalTools: 3,
                activeTools: progress.studyStreak > 0 ? 3 : 0,
                averageProgress: Math.round((
                    Math.min(100, Math.round(((progress.questionsAnswered || 0) / 5000) * 100)) +
                    Math.min(100, Math.round(((progress.totalStudyTime || 0) / (50 * 60)) * 100)) +
                    Math.min(100, Math.round(((progress.testsCompleted || 0) * 5 / 1000) * 100))
                ) / 3),
                totalTimeSpent: progress.totalStudyTime || 0,
                currentStreak: progress.studyStreak || 0,
            },
        }
    } catch (error) {
        console.error('Error in getStudyToolsProgress:', error)
        throw error
    }
}
