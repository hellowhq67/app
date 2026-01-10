import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockTests, testAttempts, testAnswers, pteQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { scorePteAttemptV2 } from "@/lib/ai/scoring-agent";
import { QuestionType } from "@/lib/types";
import { ratelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

// Helper (Duplicate for now, ideal to refactor)
async function fetchQuestionData(questionId: string) {
    const baseQ = await db.query.pteQuestions.findFirst({
        where: eq(pteQuestions.id, questionId),
        with: {
            questionType: true,
            speaking: true,
            writing: true,
            reading: true,
            listening: true
        }
    });
    return baseQ;
}

export async function POST(req: Request) {
    try {
        const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
        const { success } = await ratelimit.limit(ip);
        // We can be lenient on submit? Or standard.
        // If they spam submit, block.
        if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

        const { attemptId, answer, timeSpentMs } = await req.json();

        if (!attemptId || !answer) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const attempt = await db.query.testAttempts.findFirst({
            where: eq(testAttempts.id, attemptId),
            with: {
                // We need the template to know the next question
                // But Drizzle relations setup for `mockTests` might not be explicit in `testAttempts` query yet without defining relations.
                // We'll fetch attempt first, then fetch template.
            }
        });

        if (!attempt) {
            return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
        }

        if (attempt.status === 'completed') {
            return NextResponse.json({ finished: true });
        }

        const template = await db.query.mockTests.findFirst({
            where: eq(mockTests.id, attempt.mockTestId)
        });

        if (!template) return NextResponse.json({ error: "Template missing" }, { status: 500 });

        const questionsList = template.questions as any[];
        const currentIndex = attempt.currentQuestionIndex || 0;
        const currentQItem = questionsList[currentIndex];

        if (!currentQItem) {
            // Already done?
            return NextResponse.json({ finished: true });
        }

        const questionId = currentQItem.questionId;
        const fullQuestion = await fetchQuestionData(questionId);

        if (!fullQuestion) {
            console.error(`Question ${questionId} not found in DB`);
            // Skip/Error? We'll error for now.
            return NextResponse.json({ error: "Question Data Missing" }, { status: 500 });
        }

        // --- SCORING ---
        // Map DB Type name to Enum
        const typeName = fullQuestion.questionType.name; // e.g. "Read Aloud"
        // We assume the DB name matches the Enum string value. 
        // Need to be careful. The Enum has 'Read Aloud', DB might have 'read-aloud' code or 'Read Aloud' name.
        // Let's assume name matches or we map it.
        // Ideally we use the 'code' from pte_question_types but schema doesn't show code on fetch unless requested.
        // Assuming fetchQuestionData includes questionType fields.

        // Prepare strict params
        const qType = Object.values(QuestionType).find(t => t === typeName) || Object.values(QuestionType).find(t => t.toLowerCase() === typeName.toLowerCase()) as QuestionType;

        if (qType) {
            // Determine Ideal Answer / Content
            let content = fullQuestion.content || "";
            let ideal = fullQuestion.sampleAnswer || ""; // Base fallback

            // Override based on specific type fields
            if (fullQuestion.speaking?.sampleTranscript) ideal = fullQuestion.speaking.sampleTranscript;
            if (fullQuestion.writing?.promptText) content = fullQuestion.writing.promptText;
            if (fullQuestion.reading?.passageText) content = fullQuestion.reading.passageText;

            // ASYNC SCORING (We await for now to simplify data consistency, but in prod we might background it)
            const scoreResult = await scorePteAttemptV2(qType, {
                questionContent: content,
                submission: answer, // { text?, audioUrl? }
                idealAnswer: ideal,
            });

            // SAVE ANSWER
            await db.insert(testAnswers).values({
                attemptId,
                questionId,
                questionType: typeName,
                answer,
                aiScore: scoreResult as any, // Store full feedback JSON
                timeSpentMs
            });

        } else {
            console.warn("Could not map question type for scoring:", typeName);
            // Save without score
            await db.insert(testAnswers).values({
                attemptId,
                questionId,
                questionType: typeName,
                answer,
                timeSpentMs
            });
        }


        // --- ADVANCE ---
        const nextIndex = currentIndex + 1;

        if (nextIndex >= questionsList.length) {
            // FINISHED
            await db.update(testAttempts)
                .set({
                    status: 'completed',
                    completedAt: new Date(),
                    currentQuestionIndex: nextIndex
                })
                .where(eq(testAttempts.id, attemptId));

            return NextResponse.json({ finished: true });
        } else {
            // UPDATE INDEX
            await db.update(testAttempts)
                .set({ currentQuestionIndex: nextIndex })
                .where(eq(testAttempts.id, attemptId));

            // FETCH NEXT QUESTION
            const nextQId = questionsList[nextIndex].questionId;
            const nextQData = await fetchQuestionData(nextQId);

            return NextResponse.json({
                finished: false,
                currentQuestionIndex: nextIndex,
                question: {
                    ...nextQData,
                    correctAnswer: undefined,
                    sampleAnswer: undefined,
                    scoringRubric: undefined
                }
            });
        }

    } catch (error) {
        console.error("[MockTest Submit] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
