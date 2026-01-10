import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockTests, testAttempts, pteQuestions, pteSpeakingQuestions, pteWritingQuestions, pteReadingQuestions, pteListeningQuestions, pteQuestionTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth"; // Assuming auth setup
import { headers } from "next/headers";
import { strictRatelimit } from "@/lib/ratelimit";

// Helper to fetch full question details
// This mirrors the logic we likely need in the submit/next route too, so ideally it should be a shared lib function.
// For now, I'll inline basic fetching or call a hypothetical lib function if I created one. 
// I'll define it locally for speed, then refactor.

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
        const { success } = await strictRatelimit.limit(ip);
        if (!success) return NextResponse.json({ error: "Rate limit exceeded. Please wait." }, { status: 429 });

        // Mock Auth check (Replace with actual session check)
        // const session = await auth();
        // if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // const userId = session.user.id;

        // TEMPORARY: Hardcode user for dev if auth not fully integrated in this context
        const userId = "user_2rjE3x8...placeholder";

        const { mockTestId } = await req.json();

        if (!mockTestId) {
            return NextResponse.json({ error: "Mock Test ID required" }, { status: 400 });
        }

        const template = await db.query.mockTests.findFirst({
            where: eq(mockTests.id, mockTestId)
        });

        if (!template) {
            return NextResponse.json({ error: "Mock Test not found" }, { status: 404 });
        }

        const questionsList = template.questions as any[];
        if (!questionsList || questionsList.length === 0) {
            return NextResponse.json({ error: "Test template has no questions" }, { status: 500 });
        }

        // Create Attempt
        const [attempt] = await db.insert(testAttempts).values({
            userId,
            mockTestId,
            status: "in_progress",
            currentQuestionIndex: 0,
            startedAt: new Date(),
        }).returning();

        // Fetch First Question
        const firstQId = questionsList[0].questionId;
        const questionParams = await fetchQuestionData(firstQId);

        return NextResponse.json({
            attemptId: attempt.id,
            totalQuestions: questionsList.length,
            title: template.title,
            currentQuestionIndex: 0,
            question: {
                ...questionParams,
                // Hide sensitive data (correct answers) from client!
                correctAnswer: undefined,
                sampleAnswer: undefined,
                scoringRubric: undefined
            }
        });

    } catch (error) {
        console.error("[MockTest Start] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
