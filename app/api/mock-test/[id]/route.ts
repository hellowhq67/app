import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pteMockTests, pteMockTestQuestions, pteQuestions } from '@/lib/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id: testId } = await params;

        const test = await db.query.pteMockTests.findFirst({
            where: eq(pteMockTests.id, testId)
        });

        if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        if (test.userId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        if (test.status === 'completed') {
            return NextResponse.json({ finished: true, test });
        }

        // Find first incomplete
        const nextMockQ = await db.query.pteMockTestQuestions.findFirst({
            where: and(
                eq(pteMockTestQuestions.mockTestId, testId),
                eq(pteMockTestQuestions.isCompleted, false)
            ),
            orderBy: asc(pteMockTestQuestions.questionOrder)
        });

        if (!nextMockQ) {
            return NextResponse.json({ finished: true, test });
        }

        const question = await db.query.pteQuestions.findFirst({
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
            test, // contains currentSection, etc
            question,
            currentQuestionIndex: nextMockQ.questionOrder,
            totalQuestions: test.totalQuestions,
            finished: false
        });

    } catch (error) {
        console.error('Error fetching mock test:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
