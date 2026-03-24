export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { pteMockTests, pteMockTestQuestions, pteQuestions } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import MockTestRunner from '@/components/pte/mock-test/MockTestRunner';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function MockTestPage({ params }: { params: Promise<{ testId: string }> }) {
    const { testId } = await params;

    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        redirect('/sign-in');
    }

    // 1. Fetch Test Session
    const test = await db.query.pteMockTests.findFirst({
        where: and(
            eq(pteMockTests.id, testId),
            eq(pteMockTests.userId, session.user.id)
        ),
    });

    if (!test) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Test Not Found</h1>
                <p className="text-muted-foreground">{"This test session does not exist or you don't have access to it."}</p>
            </div>
        );
    }

    // If completed, redirect to results
    if (test.status === 'completed') {
        redirect(`/academic/mock-tests/${testId}/result`);
    }

    // 2. Get all test questions to determine progress
    const allQuestions = await db.query.pteMockTestQuestions.findMany({
        where: eq(pteMockTestQuestions.mockTestId, testId),
        orderBy: asc(pteMockTestQuestions.questionOrder),
    });

    // 3. Find Current Question (first incomplete)
    const currentMockQ = allQuestions.find((q) => !q.isCompleted);

    // If no incomplete question found, test is complete
    if (!currentMockQ) {
        redirect(`/academic/mock-tests/${testId}/result`);
    }

    // 4. Fetch Full Question Details
    const questionData = await db.query.pteQuestions.findFirst({
        where: eq(pteQuestions.id, currentMockQ.questionId),
        with: {
            questionType: true,
            speaking: true,
            writing: true,
            reading: true,
            listening: true,
        },
    });

    if (!questionData) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Question Data Missing</h1>
                <p className="text-muted-foreground">Unable to load question data. Please contact support.</p>
            </div>
        );
    }

    // 5. Sanitize (remove correct answers from client)
    const sanitizedQuestion = {
        ...questionData,
        correctAnswer: undefined,
    };

    // 6. Calculate section name based on question order
    const getSectionName = (order: number): string => {
        if (order <= 25) return 'Part 1: Speaking & Writing';
        if (order <= 40) return 'Part 2: Reading';
        return 'Part 3: Listening';
    };

    return (
        <MockTestRunner
            attemptId={testId}
            initialQuestion={sanitizedQuestion}
            initialIndex={currentMockQ.questionOrder}
            totalQuestions={test.totalQuestions}
            title="PTE Academic Full Mock Test"
            initialSectionTitle={getSectionName(currentMockQ.questionOrder)}
        />
    );
}
