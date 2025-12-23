import { generateObject } from 'ai';
import { proModel } from '@/lib/ai/config';
import { writingScoreSchema } from '@/lib/pte/schemas';
import { db } from '@/lib/db';
import { writingAttempts } from '@/lib/db/schema/writing';
import { countWords } from '@/lib/utils';

export async function submitWritingAttempt({
    userId,
    questionId,
    questionText,
    userAnswer,
    timeTaken
}: {
    userId: string;
    questionId: string;
    questionText: string;
    userAnswer: string;
    timeTaken?: number;
}) {
    const wordCount = countWords(userAnswer);

    const { object: scoring } = await generateObject({
        model: proModel,
        schema: writingScoreSchema,
        system: `You are a PTE Academic writing examiner. 
    Score the user's response strictly according to PTE Academic standards.
    Provide detailed feedback and suggestions for improvement.`,
        prompt: `Question Prompt: ${questionText}\n\nStudent's Answer: ${userAnswer}`,
    });

    // Save to database
    const [attempt] = await db.insert(writingAttempts).values({
        userId,
        questionId,
        userResponse: userAnswer,
        wordCount,
        overallScore: scoring.overallScore,
        grammarScore: scoring.grammarScore,
        vocabularyScore: scoring.vocabularyScore,
        coherenceScore: scoring.coherenceScore,
        contentScore: scoring.contentScore,
        scores: scoring,
        timeTaken,
    }).returning();

    return attempt;
}
