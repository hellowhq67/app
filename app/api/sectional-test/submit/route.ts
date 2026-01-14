import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    pteSectionalTests,
    pteSectionalAttempts,
    pteQuestions,
    users
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { QuestionType } from '@/lib/types';
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { scoreDeterministic } from '@/lib/ai/deterministic-scoring';
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring';

function buildDeterministicAnswer(
    type: QuestionType,
    answerKey: any,
    options?: any, // can be array or object
    paragraphs?: string[]
): any {
    // Reuse logic from actions/pte.ts
    if (typeof answerKey === 'object' && !Array.isArray(answerKey)) {
        return { correctBlanks: answerKey };
    }
    const opts = Array.isArray(options) ? options : options?.choices; // handle both simple array and object

    if (Array.isArray(answerKey) && answerKey.length > 0) {
        switch (type) {
            case QuestionType.MULTIPLE_CHOICE_SINGLE:
            case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
                return { correctOption: opts?.[answerKey[0]] || '' };

            case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
                return { correctOptions: answerKey.map((idx: number) => opts?.[idx] || '').filter(Boolean) };

            case QuestionType.REORDER_PARAGRAPHS:
                return { correctOrder: answerKey.map((idx: number) => paragraphs?.[idx] || '').filter(Boolean) };

            default:
                return {};
        }
    }
    return {};
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { testId, questionId, answer, timeSpentMs } = await req.json();

        // 1. Validation & Fetch
        const sectionAttempt = await db.query.pteSectionalAttempts.findFirst({
            where: and(
                eq(pteSectionalAttempts.sectionalTestId, testId),
                eq(pteSectionalAttempts.questionId, questionId)
            )
        });

        if (!sectionAttempt) {
            return NextResponse.json({ error: 'Invalid attempt or test ID' }, { status: 400 });
        }

        const question = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, questionId),
            with: {
                questionType: true,
                reading: true,
                listening: true,
                speaking: true,
                writing: true
            }
        });

        if (!question || !question.questionType) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        const typeCode = question.questionType.name || question.questionType.code; // code is usually the enum
        // Map to QuestionType enum if needed, assuming code matches enum values
        const type = typeCode as QuestionType;

        let attemptId: string | undefined;
        let feedback: any;

        // 2. Scoring Logic
        // A. SPEAKING
        if (type.includes('speaking') || type.includes('read_aloud') || type.includes('repeat') || type.includes('describe') || type.includes('retell') || type.includes('respond_to_situation') || type.includes('summarize_group_discussion')) {
            // Using AI
            const content = question.speaking?.sampleTranscript || question.content || '';
            // Note: Some speaking Qs (like Describe Image) don't have text content to match against like Read Aloud does.
            // scorePteAttemptV2 handles this based on type.

            if (answer.audioUrl) {
                feedback = await scorePteAttemptV2(type, {
                    questionContent: content,
                    submission: { audioUrl: answer.audioUrl },
                    userId: session.user.id,
                    questionId: question.id
                });

                const saved = await savePteAttempt({
                    userId: session.user.id,
                    questionId: question.id,
                    questionType: type,
                    responseAudioUrl: answer.audioUrl,
                    aiFeedback: feedback
                });
                attemptId = saved.id;

                // Track Usage
                await trackAIUsage({
                    userId: session.user.id,
                    attemptId: saved.id,
                    provider: 'google',
                    model: 'gemini-1.5-pro-latest',
                    totalTokens: 0,
                    cost: 0,
                });
            }
        }
        // B. WRITING
        else if (type.includes('writing') || type === QuestionType.WRITE_ESSAY || type === QuestionType.SUMMARIZE_WRITTEN_TEXT) {
            const text = answer.text || '';
            const content = question.writing?.promptText || question.content || '';

            feedback = await scorePteAttemptV2(type, {
                questionContent: content,
                submission: { text },
                userId: session.user.id,
                questionId: question.id
            });

            const saved = await savePteAttempt({
                userId: session.user.id,
                questionId: question.id,
                questionType: type,
                responseText: text,
                aiFeedback: feedback
            });
            attemptId = saved.id;

            await trackAIUsage({
                userId: session.user.id,
                attemptId: saved.id,
                provider: 'google',
                model: 'gemini-1.5-pro-latest',
                totalTokens: 0,
                cost: 0,
            });
        }
        // C. READING (Deterministic)
        else if (type.includes('reading') || type.includes('reorder')) {
            const qData = question.reading;
            const correctAnswer = buildDeterministicAnswer(
                type,
                qData?.correctAnswerPositions || question.correctAnswer, // prefer explicit column
                qData?.options || question.correctAnswer?.options,
                qData?.options?.paragraphs
            );

            feedback = scoreDeterministic(type, answer, correctAnswer); // answer should be formatted by client

            const saved = await savePteAttempt({
                userId: session.user.id,
                questionId: question.id,
                questionType: type,
                responseData: { userResponse: answer, answerKey: correctAnswer },
                aiFeedback: feedback || undefined // handle null
            });
            attemptId = saved.id;
        }
        // D. LISTENING (Mixed)
        else if (type.includes('listening') || type === QuestionType.SUMMARIZE_SPOKEN_TEXT) {
            if (type === QuestionType.SUMMARIZE_SPOKEN_TEXT) {
                const audioTranscript = question.listening?.transcript || '';
                const content = (question.content || '') + '\n\nAudio Transcript:\n' + audioTranscript;

                feedback = await scorePteAttemptV2(type, {
                    questionContent: content,
                    submission: { text: answer.text },
                    userId: session.user.id,
                    questionId: question.id
                });

                const saved = await savePteAttempt({
                    userId: session.user.id,
                    questionId: question.id,
                    questionType: type,
                    responseText: answer.text,
                    aiFeedback: feedback
                });
                attemptId = saved.id;

                await trackAIUsage({
                    userId: session.user.id,
                    attemptId: saved.id,
                    provider: 'google',
                    model: 'gemini-1.5-flash-latest',
                    totalTokens: 0,
                    cost: 0,
                });
            } else {
                // Deterministic Listening
                const qData = question.listening;
                const correctAnswer = buildDeterministicAnswer(
                    type,
                    qData?.correctAnswerPositions || question.correctAnswer,
                    qData?.options
                );
                // Special case for highlighting/blanks if needed
                if (question.correctAnswer?.correctText) correctAnswer['correctText'] = question.correctAnswer.correctText;
                if (question.correctAnswer?.incorrectWords) correctAnswer['incorrectWords'] = question.correctAnswer.incorrectWords;

                feedback = scoreDeterministic(type, answer, correctAnswer);

                const saved = await savePteAttempt({
                    userId: session.user.id,
                    questionId: question.id,
                    questionType: type,
                    responseData: { userResponse: answer, answerKey: correctAnswer },
                    aiFeedback: feedback || undefined
                });
                attemptId = saved.id;
            }
        }

        // 3. Update Sectional Attempt & Progress
        if (attemptId) {
            await db.update(pteSectionalAttempts)
                .set({
                    attemptId: attemptId,
                    timeSpent: Math.floor(timeSpentMs / 1000)
                })
                .where(eq(pteSectionalAttempts.id, sectionAttempt.id));

            // Update Test Totals
            // Need to calculate strict score to add to totalScore
            const score = feedback?.overallScore || 0;
            await db.update(pteSectionalTests)
                .set({
                    questionsAttempted: sql`questions_attempted + 1`,
                    totalScore: sql`COALESCE(total_score, 0) + ${score}`,
                    questionsCorrect: score > (question.questionType.name?.includes('multiple') ? 10 : 50) ? sql`questions_correct + 1` : sql`questions_correct` // Rough logic for 'correct' count
                })
                .where(eq(pteSectionalTests.id, testId));
        }

        // 4. Next Question
        const nextAttempt = await db.query.pteSectionalAttempts.findFirst({
            where: and(
                eq(pteSectionalAttempts.sectionalTestId, testId),
                sql`${pteSectionalAttempts.attemptId} IS NULL`
            ),
            orderBy: pteSectionalAttempts.sequence
        });

        if (!nextAttempt) {
            // Mark Completed
            await db.update(pteSectionalTests)
                .set({
                    status: 'completed',
                    completedAt: new Date()
                })
                .where(eq(pteSectionalTests.id, testId));

            return NextResponse.json({ finished: true });
        }

        // Fetch next question details
        const nextQuestion = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, nextAttempt.questionId),
            with: {
                questionType: true,
                speaking: true,
                writing: true,
                reading: true,
                listening: true
            }
        });

        return NextResponse.json({
            finished: false,
            question: nextQuestion,
            currentQuestionIndex: nextAttempt.sequence
        });

    } catch (error) {
        console.error('Error submitting sectional test answer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
