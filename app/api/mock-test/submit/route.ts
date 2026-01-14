import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    pteMockTests,
    pteMockTestQuestions,
    pteQuestions
} from '@/lib/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { QuestionType } from '@/lib/types';
import { scoreAndSaveAttempt } from '@/lib/pte/scoring-dispatcher';
import { runMockTestScoringPipeline } from '@/lib/pte/scoring-engine/pipeline';


export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { testId, questionId, answer, timeSpentMs } = await req.json();

        // 1. Validate Attempt
        const mockQuestion = await db.query.pteMockTestQuestions.findFirst({
            where: and(
                eq(pteMockTestQuestions.mockTestId, testId),
                eq(pteMockTestQuestions.questionId, questionId)
            )
        });

        if (!mockQuestion) {
            return NextResponse.json({ error: 'Question not assigned to this test' }, { status: 404 });
        }

        const question = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, questionId),
            with: {
                questionType: true,
                speaking: true,
                writing: true,
                reading: true,
                listening: true
            }
        });

        if (!question || !question.questionType) {
            return NextResponse.json({ error: 'Question details not found' }, { status: 404 });
        }

        const typeCode = question.questionType.name || question.questionType.code;
        const type = typeCode as QuestionType;

        // 2. Score
        const { attemptId, feedback } = await scoreAndSaveAttempt(
            session.user.id,
            question,
            answer,
            type
        );

        // 3. Update Progress
        await db.update(pteMockTestQuestions).set({
            attemptId,
            isCompleted: true,
            completedAt: new Date(),
            score: feedback?.overallScore || 0
        }).where(eq(pteMockTestQuestions.id, mockQuestion.id));

        await db.update(pteMockTests).set({
            completedQuestions: sql`completed_questions + 1`
            // We defer score aggregation to end or periodic
        }).where(eq(pteMockTests.id, testId));

        // 4. Find Next Question
        const nextMockQ = await db.query.pteMockTestQuestions.findFirst({
            where: and(
                eq(pteMockTestQuestions.mockTestId, testId),
                eq(pteMockTestQuestions.isCompleted, false)
            ),
            orderBy: asc(pteMockTestQuestions.questionOrder)
        });



        if (!nextMockQ) {
            // Test Complete - Run Scoring Pipeline
            await runMockTestScoringPipeline(testId);

            // Note: pipeline updates status to 'completed' and overallScore.
            // We just return finished.

            return NextResponse.json({ completed: true, testCompleted: true });
        }

        // 5. Check Section Transition
        let sectionChanged = false;
        let nextSection = nextMockQ.sectionName;

        if (nextMockQ.sectionName !== mockQuestion.sectionName) {
            // Detect section change
            // Wait, what if questions of same section are interleaved? (Unlikely in PTE standard)
            // Assume sequential.
            sectionChanged = true;

            // Update Test Status
            await db.update(pteMockTests).set({
                currentSection: nextSection,
                sectionStartedAt: new Date(),
                // Reset time limit?
                // sectionTimeLeft = ... (Lookup durations)
            }).where(eq(pteMockTests.id, testId));
        }

        // Fetch Next details
        const nextQuestion = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, nextMockQ.questionId),
            with: {
                questionType: true,
                speaking: true,
                writing: true,
                reading: true,
                listening: true
            }
        });

        return NextResponse.json({
            completed: false,
            sectionChanged,
            nextSection,
            nextQuestion: nextQuestion,
            currentQuestionIndex: nextMockQ.questionOrder
        });

    } catch (error) {
        console.error('Error submitting mock test:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
