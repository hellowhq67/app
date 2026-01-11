
import { db } from '@/lib/db/drizzle';
import { pteAttempts, aiCreditUsage } from '@/lib/db/schema';
import { AIFeedbackData, QuestionType } from '@/lib/types';
import { eq, and, desc } from 'drizzle-orm';
import { upsertRecord } from '@/lib/ai/vector-store';

/**
 * Save PTE attempt with AI scoring results to the database
 */
export async function savePteAttempt(params: {
    userId: string;
    questionId: string;
    questionType: QuestionType;
    responseText?: string;
    responseAudioUrl?: string;
    responseData?: any;
    timeTaken?: number;
    aiFeedback: AIFeedbackData;
}) {
    const {
        userId,
        questionId,
        questionType,
        responseText,
        responseAudioUrl,
        responseData,
        timeTaken,
        aiFeedback = {} as AIFeedbackData, // Default to empty object to prevent crash
    } = params;

    // Calculate attempt number for this user and question
    const existingAttempts = await db
        .select()
        .from(pteAttempts)
        .where(and(
            eq(pteAttempts.questionId, questionId),
            eq(pteAttempts.userId, userId)
        ));

    const attemptNumber = existingAttempts.length + 1;

    // Prepare AI scores object
    const aiScores = {
        pronunciation: aiFeedback.pronunciation?.score,
        fluency: aiFeedback.fluency?.score,
        content: aiFeedback.content?.score,
        grammar: aiFeedback.grammar?.score,
        vocabulary: aiFeedback.vocabulary?.score,
        spelling: aiFeedback.spelling?.score,
        form: aiFeedback.structure?.score,
        accuracy: aiFeedback.accuracy?.score,
        total: aiFeedback.overallScore,
    };

    // Prepare AI feedback text
    const feedbackParts: string[] = [];
    if (aiFeedback.pronunciation) feedbackParts.push(`Pronunciation: ${aiFeedback.pronunciation.feedback}`);
    if (aiFeedback.fluency) feedbackParts.push(`Fluency: ${aiFeedback.fluency.feedback}`);
    if (aiFeedback.content) feedbackParts.push(`Content: ${aiFeedback.content.feedback}`);
    if (aiFeedback.grammar) feedbackParts.push(`Grammar: ${aiFeedback.grammar.feedback}`);
    if (aiFeedback.vocabulary) feedbackParts.push(`Vocabulary: ${aiFeedback.vocabulary.feedback}`);
    if (aiFeedback.spelling) feedbackParts.push(`Spelling: ${aiFeedback.spelling.feedback}`);
    if (aiFeedback.structure) feedbackParts.push(`Structure: ${aiFeedback.structure.feedback}`);
    if (aiFeedback.accuracy) feedbackParts.push(`Accuracy: ${aiFeedback.accuracy.feedback}`);

    if (aiFeedback.strengths?.length) feedbackParts.push(`\n\nStrengths:\n${aiFeedback.strengths.map(s => `- ${s}`).join('\n')}`);
    if (aiFeedback.areasForImprovement?.length) feedbackParts.push(`\n\nAreas for Improvement:\n${aiFeedback.areasForImprovement.map(a => `- ${a}`).join('\n')}`);
    if (aiFeedback.suggestions?.length) feedbackParts.push(`\n\nSuggestions:\n${aiFeedback.suggestions.map(s => `- ${s}`).join('\n')}`);

    const aiFeedbackText = feedbackParts.join('\n\n');

    // Insert the attempt
    const [attempt] = await db
        .insert(pteAttempts)
        .values({
            userId,
            questionId,
            status: 'completed',
            attemptNumber,
            responseText,
            responseAudioUrl,
            responseData,
            timeTaken,
            aiScore: aiFeedback.overallScore,
            aiScores,
            aiFeedback: aiFeedbackText,
            aiScoredAt: new Date(),
            finalScore: aiFeedback.overallScore,
            completedAt: new Date(),
        })
        .returning();

    // NEW: Vector Embedding Logic for Weak Areas
    // If we have text content (user response or transcript), upsert it to Pinecone
    try {
        const textToEmbed = responseText || aiFeedback.transcript;
        if (textToEmbed && textToEmbed.length > 10) { // Embed only significant content
            // Fire and forget or await? For reliability, we await, but wrapped in try/catch so it doesn't block the UI response if it key fails
            await upsertRecord(userId, attempt.id, textToEmbed, {
                questionId,
                questionType,
                score: aiFeedback.overallScore,
                isWeakness: aiFeedback.overallScore < 60,
                feedbackStrengths: aiFeedback.strengths,
                feedbackImprovements: aiFeedback.areasForImprovement,
            });
        }
    } catch (vectorError) {
        console.error('[savePteAttempt] Vector embedding failed (non-critical):', vectorError);
    }

    return attempt;
}

/**
 * Track AI credit usage for scoring
 */
export async function trackAIUsage(params: {
    userId: string;
    attemptId: string;
    provider: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cost?: number;
}) {
    const {
        userId,
        attemptId,
        provider,
        model,
        inputTokens = 0,
        outputTokens = 0,
        totalTokens = 0,
        cost = 0,
    } = params;

    await db.insert(aiCreditUsage).values({
        userId,
        usageType: 'scoring',
        provider,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: cost.toString(),
        pteAttemptId: attemptId,
        attemptType: 'pte',
    });
}

/**
 * Get user's attempts for a specific question
 */
export async function getUserAttempts(userId: string, questionId: string) {
    return await db
        .select()
        .from(pteAttempts)
        .where(and(
            eq(pteAttempts.userId, userId),
            eq(pteAttempts.questionId, questionId)
        ))
        .orderBy(desc(pteAttempts.createdAt));
}

/**
 * Get user's latest attempt for a question
 */
export async function getLatestAttempt(userId: string, questionId: string) {
    const attempts = await getUserAttempts(userId, questionId);
    return attempts[0] || null;
}

/**
 * Get all attempts for a user
 */
export async function getAllUserAttempts(userId: string) {
    return await db.query.pteAttempts.findMany({
        where: eq(pteAttempts.userId, userId),
        with: {
            question: {
                with: {
                    questionType: {
                        with: {
                            category: true
                        }
                    }
                }
            },
        },
        orderBy: desc(pteAttempts.createdAt),
    });
}
