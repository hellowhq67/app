import { db } from '@/lib/db';
import { pteMockTestQuestions, pteMockTests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { aggregateSkillScores } from './aggregator';
import { QuestionType } from '@/lib/types';
import { ScoringResult } from './types';
import { MAX_RAW_SCORES } from './max-scores';

export async function runMockTestScoringPipeline(mockTestId: string): Promise<ScoringResult> {
    console.log(`[ScoringPipeline] Starting scoring for test: ${mockTestId}`);

    // 1. Fetch Questions and Linked Attempts
    // We need to fetch the questionType (relation on question) and finalScore (relation on attempt)
    const testItems = await db.query.pteMockTestQuestions.findMany({
        where: eq(pteMockTestQuestions.mockTestId, mockTestId),
        with: {
            attempt: true, // Only need data, no detailed relations
            question: {
                with: {
                    questionType: true
                }
            }
        }
    });

    if (!testItems || testItems.length === 0) {
        console.warn(`[ScoringPipeline] No questions found for test ${mockTestId}`);
        return {
            overallScore: 0,
            communicativeSkills: { speaking: 0, writing: 0, reading: 0, listening: 0 }
        };
    }

    // 2. Map & Prepare for Aggregation
    const attemptsToScore: { questionType: QuestionType; aiFeedback: any; maxScore: number }[] = [];
    const maxScores: Record<QuestionType, number> = {} as any;

    testItems.forEach(item => {
        // Skip incomplete or unattempted
        if (!item.attemptId || !item.attempt || !item.question || !item.question.questionType) {
            return;
        }

        // Determine Question Type Enum
        const qt = item.question.questionType as any;
        // pte_question_types likely has 'code' or 'name'. Code is usually the enum match.
        const typeCode = (qt.code || qt.name) as QuestionType;

        if (!typeCode) return;

        // Extract Score
        // item.attempt.finalScore is the points earned.
        // If finalScore is null, use aiScore, or aiFeedback.overallScore (legacy)
        let earnedPoints = item.attempt.finalScore;
        if (earnedPoints === null || earnedPoints === undefined) {
            earnedPoints = item.attempt.aiScore || 0;
            // Check aiScores jsonb if needed, but assuming final/aiScore is populated.
        }

        // Aggregator expects aiFeedback object.
        const feedback = { overallScore: earnedPoints };

        // Determine Max Score (Denominator)
        let maxPoints = MAX_RAW_SCORES[typeCode];

        // Handle Dynamic Max Scores (where value is -1 or undefined)
        if (!maxPoints || maxPoints === -1) {
            const answer = item.question.correctAnswer as any;
            if (answer) {
                if (typeCode === QuestionType.READING_BLANKS ||
                    typeCode === QuestionType.READING_WRITING_BLANKS ||
                    typeCode === QuestionType.LISTENING_BLANKS) {
                    // Count blanks
                    if (answer.blanks) maxPoints = Object.keys(answer.blanks).length;
                } else if (typeCode === QuestionType.WRITE_FROM_DICTATION) {
                    // Count words
                    if (answer.text) maxPoints = answer.text.trim().split(/\s+/).length;
                } else if (typeCode === QuestionType.REORDER_PARAGRAPHS) {
                    // Pairs = N - 1
                    if (answer.order && Array.isArray(answer.order)) maxPoints = Math.max(0, answer.order.length - 1);
                } else if (typeCode === QuestionType.MULTIPLE_CHOICE_MULTIPLE ||
                    typeCode === QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE ||
                    typeCode === QuestionType.HIGHLIGHT_INCORRECT_WORDS) {
                    // Count correct options
                    if (answer.options && Array.isArray(answer.options)) maxPoints = answer.options.length;
                    // For Highlight Incorrect Words, usually 'options' or 'indices' holds correct ones. 
                    // Checking pte-questions.ts schema -> correctAnswer stores generic structure.
                }
            }
        }

        // Fallback default
        if (!maxPoints || maxPoints <= 0) maxPoints = 1; // Prevent division by zero, default to 1

        attemptsToScore.push({
            questionType: typeCode,
            aiFeedback: feedback,
            maxScore: maxPoints
        });

        // Sum Max Score per type to build the 'Potential' map
        if (!maxScores[typeCode]) maxScores[typeCode] = 0;
        maxScores[typeCode] += maxPoints;
    });

    // 3. Run Aggregation
    const result = aggregateSkillScores(attemptsToScore, maxScores);

    console.log(`[ScoringPipeline] Scoring complete. Overall: ${result.overallScore}`);

    // 4. Save to Database
    await db.update(pteMockTests)
        .set({
            overallScore: result.overallScore,
            speakingScore: result.communicativeSkills.speaking,
            writingScore: result.communicativeSkills.writing,
            readingScore: result.communicativeSkills.reading,
            listeningScore: result.communicativeSkills.listening,
            status: 'completed',
            completedAt: new Date()
        })
        .where(eq(pteMockTests.id, mockTestId));

    return result;
}
