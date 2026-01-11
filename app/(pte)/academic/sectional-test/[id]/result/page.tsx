import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pteSectionalTests, pteSectionalAttempts } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export default async function SectionalTestResultPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        redirect('/auth/login');
    }

    const test = await db.query.pteSectionalTests.findFirst({
        where: eq(pteSectionalTests.id, id),
        with: {
            attempts: {
                orderBy: asc(pteSectionalAttempts.sequence),
                with: {
                    question: {
                        with: { questionType: true }
                    },
                    originalAttempt: true // To get score details
                }
            }
        }
    });

    if (!test) {
        notFound();
    }

    if (test.userId !== session.user.id) {
        redirect('/dashboard');
    }

    // Calculate stats - handle aiFeedback properly (can be string or object)
    const totalQuestions = test.questionsAttempted;
    const correctCount = test.questionsCorrect; // Rough count

    let totalScore = 0;
    const attemptsWithData = test.attempts.map(a => {
        let feedback: any = null;
        if (a.originalAttempt?.aiFeedback) {
            feedback = typeof a.originalAttempt.aiFeedback === 'string'
                ? JSON.parse(a.originalAttempt.aiFeedback)
                : a.originalAttempt.aiFeedback;
        }
        const score = feedback?.overallScore || 0;
        totalScore += score;

        return {
            ...a,
            parsedFeedback: feedback,
            calculatedScore: score
        };
    });

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Test Results</h1>
                <Link href="/academic/sectional-test">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Score (Est.)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalScore}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Questions Attempted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test.questionsAttempted} / {test.attempts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.floor((test.timeSpent || 0) / 60)}m {(test.timeSpent || 0) % 60}s
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Question Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {attemptsWithData.map((attempt, idx) => {
                            const isGood = attempt.calculatedScore > 50;

                            return (
                                <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="font-mono text-sm text-muted-foreground w-8">#{idx + 1}</div>
                                        <div>
                                            <div className="font-medium">{attempt.question.title}</div>
                                            <div className="text-sm text-muted-foreground">{attempt.question.questionType.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`font-bold ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
                                            {attempt.calculatedScore} pts
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
