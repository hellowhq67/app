'use server';

import { db } from '@/lib/db/drizzle';
import { getSession } from '@/lib/auth/session';
import {
    pteMockTests,
    pteMockTestQuestions,
    pteAttempts,
} from '@/lib/db/schema/pte-attempts';
import { pteQuestions } from '@/lib/db/schema/pte-questions';
import { eq, desc, and } from 'drizzle-orm';
import { getQuestionTypeByCode } from '@/lib/constants/pte-questions';

type TestType = 'full_test' | 'speaking_section' | 'writing_section' | 'reading_section' | 'listening_section';

interface StartMockTestInput {
    testType: TestType;
    testName: string;
}

interface StartMockTestResult {
    success: boolean;
    testId?: string;
    error?: string;
}

export async function startMockTest(input: StartMockTestInput): Promise<StartMockTestResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get questions based on test type
        let sectionFilter: string[] = [];
        let questionLimit = 70;

        switch (input.testType) {
            case 'speaking_section':
                sectionFilter = ['speaking'];
                questionLimit = 35;
                break;
            case 'writing_section':
                sectionFilter = ['writing'];
                questionLimit = 4;
                break;
            case 'reading_section':
                sectionFilter = ['reading'];
                questionLimit = 20;
                break;
            case 'listening_section':
                sectionFilter = ['listening'];
                questionLimit = 22;
                break;
            default:
                // Full test - all sections
                sectionFilter = ['speaking', 'writing', 'reading', 'listening'];
                questionLimit = 70;
        }

        // Fetch available questions from DB
        const availableQuestions = await db
            .select()
            .from(pteQuestions)
            .where(eq(pteQuestions.isActive, true))
            .limit(questionLimit);

        if (availableQuestions.length === 0) {
            return { success: false, error: 'No questions available' };
        }

        // Create the mock test
        const [mockTest] = await db
            .insert(pteMockTests)
            .values({
                userId: session.user.id,
                testName: input.testName,
                status: 'in_progress',
                totalQuestions: availableQuestions.length,
                completedQuestions: 0,
                startedAt: new Date(),
                metadata: {
                    testType: input.testType === 'full_test' ? 'full' : 'section',
                },
            })
            .returning();

        // Link questions to the mock test
        const mockTestQuestions = availableQuestions.map((q, index) => ({
            mockTestId: mockTest.id,
            questionId: q.id,
            questionOrder: index + 1,
            sectionName: getQuestionTypeByCode(q.questionTypeId)?.category || 'General',
            maxScore: 10,
            isCompleted: false,
        }));

        await db.insert(pteMockTestQuestions).values(mockTestQuestions);

        return { success: true, testId: mockTest.id };
    } catch (error) {
        console.error('Error starting mock test:', error);
        return { success: false, error: 'Failed to start test' };
    }
}

interface GetUserMockTestsResult {
    success: boolean;
    data?: {
        id: string;
        testType: string;
        testName: string;
        createdAt: Date;
        overallScore?: number | null;
        totalQuestions: number;
        totalDuration?: number | null;
        status: string;
    }[];
    error?: string;
}

export async function getUserMockTests(): Promise<GetUserMockTestsResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const tests = await db
            .select()
            .from(pteMockTests)
            .where(eq(pteMockTests.userId, session.user.id))
            .orderBy(desc(pteMockTests.createdAt));

        const formattedTests = tests.map((test) => ({
            id: test.id,
            testType: (test.metadata as { testType?: string })?.testType || 'full',
            testName: test.testName,
            createdAt: test.createdAt,
            overallScore: test.overallScore,
            totalQuestions: test.totalQuestions,
            totalDuration: test.totalDuration,
            status: test.status,
        }));

        return { success: true, data: formattedTests };
    } catch (error) {
        console.error('Error fetching user mock tests:', error);
        return { success: false, error: 'Failed to fetch tests' };
    }
}

interface GetMockTestResult {
    success: boolean;
    data?: {
        test: typeof pteMockTests.$inferSelect;
        questions: (typeof pteMockTestQuestions.$inferSelect & {
            question: typeof pteQuestions.$inferSelect;
        })[];
        attempts: typeof pteAttempts.$inferSelect[];
    };
    error?: string;
}

export async function getMockTest(testId: string): Promise<GetMockTestResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get the test
        const [test] = await db
            .select()
            .from(pteMockTests)
            .where(
                and(
                    eq(pteMockTests.id, testId),
                    eq(pteMockTests.userId, session.user.id)
                )
            );

        if (!test) {
            return { success: false, error: 'Test not found' };
        }

        // Get linked questions with full question data
        const mockTestQuestions = await db
            .select()
            .from(pteMockTestQuestions)
            .leftJoin(pteQuestions, eq(pteMockTestQuestions.questionId, pteQuestions.id))
            .where(eq(pteMockTestQuestions.mockTestId, testId))
            .orderBy(pteMockTestQuestions.questionOrder);

        const questions = mockTestQuestions.map((mq) => ({
            ...mq.pte_mock_test_questions,
            question: mq.pte_questions!,
        }));

        // Get existing attempts for this test's questions
        const questionIds = questions.map((q) => q.questionId);
        const attempts = await db
            .select()
            .from(pteAttempts)
            .where(eq(pteAttempts.userId, session.user.id));

        const relevantAttempts = attempts.filter((a) =>
            questionIds.includes(a.questionId)
        );

        return {
            success: true,
            data: {
                test,
                questions,
                attempts: relevantAttempts,
            },
        };
    } catch (error) {
        console.error('Error fetching mock test:', error);
        return { success: false, error: 'Failed to fetch test' };
    }
}

interface SubmitMockAnswerInput {
    testId: string;
    questionId: string;
    answerText?: string;
    audioUrl?: string | null;
    durationSeconds: number;
    mockQuestionId: string;
}

interface SubmitMockAnswerResult {
    success: boolean;
    attemptId?: string;
    error?: string;
}

export async function submitMockAnswer(
    input: SubmitMockAnswerInput
): Promise<SubmitMockAnswerResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Create attempt record
        const [attempt] = await db
            .insert(pteAttempts)
            .values({
                userId: session.user.id,
                questionId: input.questionId,
                status: 'completed',
                responseText: input.answerText,
                responseAudioUrl: input.audioUrl || undefined,
                timeTaken: input.durationSeconds,
                completedAt: new Date(),
            })
            .returning();

        // Update mock test question with attempt
        await db
            .update(pteMockTestQuestions)
            .set({
                attemptId: attempt.id,
                isCompleted: true,
                completedAt: new Date(),
            })
            .where(eq(pteMockTestQuestions.id, input.mockQuestionId));

        // Update mock test completed questions count
        await db
            .update(pteMockTests)
            .set({
                completedQuestions: (
                    await db
                        .select()
                        .from(pteMockTestQuestions)
                        .where(
                            and(
                                eq(pteMockTestQuestions.mockTestId, input.testId),
                                eq(pteMockTestQuestions.isCompleted, true)
                            )
                        )
                ).length,
            })
            .where(eq(pteMockTests.id, input.testId));

        return { success: true, attemptId: attempt.id };
    } catch (error) {
        console.error('Error submitting answer:', error);
        return { success: false, error: 'Failed to submit answer' };
    }
}

interface CompleteMockTestResult {
    success: boolean;
    score?: number;
    error?: string;
}

export async function completeMockTest(
    testId: string
): Promise<CompleteMockTestResult> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Calculate test duration
        const [test] = await db
            .select()
            .from(pteMockTests)
            .where(
                and(
                    eq(pteMockTests.id, testId),
                    eq(pteMockTests.userId, session.user.id)
                )
            );

        if (!test) {
            return { success: false, error: 'Test not found' };
        }

        const startTime = test.startedAt || test.createdAt;
        const duration = Math.floor(
            (Date.now() - new Date(startTime).getTime()) / 1000
        );

        // Update test status
        await db
            .update(pteMockTests)
            .set({
                status: 'completed',
                completedAt: new Date(),
                totalDuration: duration,
            })
            .where(eq(pteMockTests.id, testId));

        return { success: true };
    } catch (error) {
        console.error('Error completing mock test:', error);
        return { success: false, error: 'Failed to complete test' };
    }
}
