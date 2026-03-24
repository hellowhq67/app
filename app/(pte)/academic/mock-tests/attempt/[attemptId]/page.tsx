export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { testAttempts, mockTests, pteQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import MockTestRunner from "@/components/pte/mock-test/MockTestRunner";

// Inline helper for now (Shared logic)
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

interface PageProps {
    params: Promise<{ attemptId: string }>;
}

export default async function MockTestPage({ params }: PageProps) {
    // Await params in Next.js 15+
    const { attemptId } = await params;

    const attempt = await db.query.testAttempts.findFirst({
        where: eq(testAttempts.id, attemptId)
    });

    if (!attempt) {
        return <div>Attempt not found</div>;
    }

    if (attempt.status === 'completed') {
        redirect(`/mock-test/${attemptId}/result`);
    }

    const template = await db.query.mockTests.findFirst({
        where: eq(mockTests.id, attempt.mockTestId)
    });

    if (!template) return <div>Template missing</div>;

    const questionsList = template.questions as any[];
    const currentIndex = attempt.currentQuestionIndex || 0;

    if (currentIndex >= questionsList.length) {
        // Should be completed
        return <div>Test Finished. Processing results...</div>;
    }

    const currentQId = questionsList[currentIndex].questionId;
    const questionData = await fetchQuestionData(currentQId);

    if (!questionData) return <div>Question Data Missing</div>;

    // Sanitize
    const sanitizedQuestion = {
        ...questionData,
        correctAnswer: undefined,
        sampleAnswer: undefined,
        scoringRubric: undefined
    };

    return (
        <MockTestRunner
            attemptId={attemptId}
            initialQuestion={sanitizedQuestion}
            initialIndex={currentIndex}
            totalQuestions={questionsList.length}
            title={template.title}
        />
    );
}
