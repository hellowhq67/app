import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pteSectionalTests, pteSectionalAttempts, pteQuestions } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
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

        // Fetch Test
        const test = await db.query.pteSectionalTests.findFirst({
            where: eq(pteSectionalTests.id, testId),
            with: {
                attempts: {
                    orderBy: asc(pteSectionalAttempts.sequence),
                    with: {
                        question: {
                            with: { questionType: true }
                        }
                    }
                }
            }
        });

        if (!test) {
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        if (test.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Determine State
        if (test.status === 'completed') {
            return NextResponse.json({
                test,
                finished: true
            });
        }

        // Find current question (first unattempted)
        const currentAttempt = test.attempts.find(a => !a.attemptId);

        if (!currentAttempt) {
            // If all attempted, verify status
            return NextResponse.json({
                test,
                finished: true
            });
        }

        // Fetch full details for CURRENT question
        const fullQuestion = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, currentAttempt.questionId),
            with: {
                questionType: true,
                speaking: true,
                writing: true,
                reading: true,
                listening: true
            }
        });

        return NextResponse.json({
            test,
            question: fullQuestion,
            currentQuestionIndex: currentAttempt.sequence,
            totalQuestions: test.attempts.length,
            finished: false
        });

    } catch (error) {
        console.error('Error fetching sectional test:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
