import { db } from '@/lib/db/drizzle'
import { pteQuestions, questionBookmarks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Toggle bookmark status for a question
 */
export async function toggleQuestionBookmark(userId: string, questionId: string) {
    try {
        // Check if bookmark exists
        const existingBookmark = await db
            .select()
            .from(questionBookmarks)
            .where(
                and(
                    eq(questionBookmarks.userId, userId),
                    eq(questionBookmarks.questionId, questionId)
                )
            )
            .limit(1)

        if (existingBookmark.length > 0) {
            // Remove bookmark
            await db
                .delete(questionBookmarks)
                .where(
                    and(
                        eq(questionBookmarks.userId, userId),
                        eq(questionBookmarks.questionId, questionId)
                    )
                )
            return { bookmarked: false }
        } else {
            // Add bookmark
            await db.insert(questionBookmarks).values({
                userId,
                questionId,
            })
            return { bookmarked: true }
        }
    } catch (error) {
        console.error('Error toggling question bookmark:', error)
        throw error
    }
}

/**
 * Get user's bookmarked questions
 */
export async function getUserBookmarks(userId: string) {
    try {
        return await db
            .select({
                questionId: questionBookmarks.questionId,
                bookmarkedAt: questionBookmarks.createdAt,
                question: pteQuestions,
            })
            .from(questionBookmarks)
            .leftJoin(pteQuestions, eq(questionBookmarks.questionId, pteQuestions.id))
            .where(eq(questionBookmarks.userId, userId))
            .orderBy(questionBookmarks.createdAt)
    } catch (error) {
        console.error('Error getting user bookmarks:', error)
        return []
    }
}
