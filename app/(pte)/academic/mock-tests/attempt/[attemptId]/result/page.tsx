export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { testAttempts, testAnswers, mockTests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

// HELPER: Calculate Communicative Skills
// PTE Scoring is integrated. We simplified benchmarks.
// We'll perform a basic weighted aggregation.
function calculateSkills(answers: any[]) {
    const skills = {
        speaking: { score: 10, max: 10 },
        writing: { score: 10, max: 10 },
        reading: { score: 10, max: 10 },
        listening: { score: 10, max: 10 }
    };

    // Helper to add
    const add = (skill: keyof typeof skills, points: number, maxPoints: number) => {
        skills[skill].score += points;
        skills[skill].max += maxPoints;
    };

    answers.forEach(ans => {
        const type = ans.questionType?.toLowerCase() || "";
        const score = ans.aiScore as any; // { total, checks?, ... }

        // Skip if no score (e.g. skipped or error)
        if (!score || typeof score.total !== 'number') return;

        const earned = score.total;
        const possible = score.maxScore || 90; // Fallback if maxScore not stored, usually strictly it varies per item (e.g. RA is ~15)
        // For accurate PTE, we need maxScore per item.
        // Our strict scoring mock (lib/ai/scoring-mock.ts) returns { total: X }. Does it return max?
        // Let's assume for MVP we sum 'total' and normalize later.
        // Actually, we need to know WHICH skills this item contributes to.

        // MAPPING (Simplified for MVP)
        if (type.includes('read aloud')) {
            add('speaking', earned * 0.5, possible * 0.5);
            add('reading', earned * 0.5, possible * 0.5);
        } else if (type.includes('repeat sentence')) {
            add('speaking', earned * 0.5, possible * 0.5);
            add('listening', earned * 0.5, possible * 0.5);
        } else if (type.includes('describe image')) {
            add('speaking', earned, possible);
        } else if (type.includes('retell lecture')) {
            add('speaking', earned * 0.5, possible * 0.5);
            add('listening', earned * 0.5, possible * 0.5);
        } else if (type.includes('essay')) {
            add('writing', earned, possible);
        } else if (type.includes('summarize written')) {
            add('reading', earned * 0.5, possible * 0.5);
            add('writing', earned * 0.5, possible * 0.5);
        } else if (type.includes('dictation')) {
            add('listening', earned * 0.5, possible * 0.5);
            add('writing', earned * 0.5, possible * 0.5);
        } else if (type.includes('spoken text')) {
            add('listening', earned * 0.5, possible * 0.5);
            add('writing', earned * 0.5, possible * 0.5);
        }
        // ... Add Reading/Listening items
        else if (type.includes('reading')) {
            add('reading', earned, possible);
        } else if (type.includes('listening')) {
            add('listening', earned, possible);
        } else {
            // Default based on guess
            if (type.includes('speak')) add('speaking', earned, possible);
            else if (type.includes('write')) add('writing', earned, possible);
            else if (type.includes('listen')) add('listening', earned, possible);
            else add('reading', earned, possible);
        }
    });

    // Normalize to 90 scale (10-90)
    const normalize = (curr: number, max: number) => {
        if (max <= 10) return 10;
        const ratio = curr / max; // 0 to 1
        return Math.round(10 + (ratio * 80));
    };

    return {
        speaking: normalize(skills.speaking.score, skills.speaking.max),
        writing: normalize(skills.writing.score, skills.writing.max),
        reading: normalize(skills.reading.score, skills.reading.max),
        listening: normalize(skills.listening.score, skills.listening.max),
    };
}

interface PageProps {
    params: Promise<{ attemptId: string }>;
}

export default async function MockResultPage({ params }: PageProps) {
    const { attemptId } = await params;

    const attempt = await db.query.testAttempts.findFirst({
        where: eq(testAttempts.id, attemptId)
    });

    if (!attempt) return <div>Data not found</div>;

    const answers = await db.query.testAnswers.findMany({
        where: eq(testAnswers.attemptId, attemptId)
    });

    const scores = calculateSkills(answers);
    const overall = Math.round((scores.speaking + scores.writing + scores.reading + scores.listening) / 4);

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Score Report</h1>
                <Link href="/academic/mock-tests">
                    <Button variant="outline">Back to Tests</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Overall Score */}
                <Card className="flex flex-col items-center justify-center p-6 bg-primary/5 border-primary/20">
                    <div className="text-2xl font-medium text-muted-foreground mb-2">Overall Score</div>
                    <div className="text-6xl font-black text-primary">{overall}</div>
                    <div className="text-sm text-muted-foreground mt-2">/ 90</div>
                </Card>

                {/* Skills Breakdown */}
                <Card className="p-6">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle>Communicative Skills</CardTitle>
                    </CardHeader>
                    <div className="space-y-6">
                        <SkillBar label="Listening" score={scores.listening} />
                        <SkillBar label="Reading" score={scores.reading} />
                        <SkillBar label="Speaking" score={scores.speaking} />
                        <SkillBar label="Writing" score={scores.writing} />
                    </div>
                </Card>
            </div>

            <h2 className="text-xl font-bold mb-4">Detailed Performance</h2>
            <div className="space-y-4">
                {answers.map((ans, i) => (
                    <Card key={ans.id} className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold capitalize">{ans.questionType.replace(/_/g, " ")}</h3>
                                <p className="text-sm text-muted-foreground">Question ID: {ans.questionId.slice(0, 8)}...</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg">
                                    {(ans.aiScore as any)?.total ?? '-'}
                                    <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
                                </div>
                            </div>
                        </div>
                        {(ans.aiScore as any)?.feedback && (
                            <div className="mt-2 text-sm bg-muted p-2 rounded">
                                <span className="font-semibold">Feedback:</span> {(ans.aiScore as any).feedback}
                            </div>
                        )}
                        {(ans.aiScore as any)?.error && (
                            <div className="mt-2 text-sm bg-red-50 text-red-600 p-2 rounded">
                                Scoring Error: {(ans.aiScore as any).error}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}

function SkillBar({ label, score }: { label: string, score: number }) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="font-medium">{label}</span>
                <span className="font-bold">{score}</span>
            </div>
            <Progress value={(score / 90) * 100} className="h-2" />
        </div>
    );
}
