import { db } from '@/lib/db';
import { pteMockTests } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Download, Eye, Trophy, Home } from 'lucide-react';
import Link from 'next/link';

export default async function MockTestResultPage({
    params,
}: {
    params: Promise<{ testId: string }>;
}) {
    const { testId } = await params;

    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        redirect('/sign-in');
    }

    // Fetch test results
    const test = await db.query.pteMockTests.findFirst({
        where: and(eq(pteMockTests.id, testId), eq(pteMockTests.userId, session.user.id)),
    });

    if (!test) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Test Not Found</h1>
                <p className="text-muted-foreground">This test does not exist or you don&apos;t have access to it.</p>
            </div>
        );
    }

    if (test.status !== 'completed') {
        redirect(`/academic/mock-tests/${testId}`);
    }

    const getScoreColor = (score: number) => {
        if (score >= 79) return 'text-green-600';
        if (score >= 65) return 'text-blue-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const sectionScores = {
        speaking: test.speakingScore || 0,
        writing: test.writingScore || 0,
        reading: test.readingScore || 0,
        listening: test.listeningScore || 0,
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold mb-2">Test Completed!</h1>
                <p className="text-muted-foreground text-lg">
                    Congratulations on completing your PTE Academic Mock Test
                </p>
            </div>

            {/* Overall Score Card */}
            <Card className="mb-6 border-2">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl mb-2">Overall Score</CardTitle>
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className="w-8 h-8 text-amber-500" />
                        <span className={`text-7xl font-bold ${getScoreColor(test.overallScore || 0)}`}>
                            {test.overallScore || 0}
                        </span>
                        <span className="text-2xl text-muted-foreground">/ 90</span>
                    </div>
                    <CardDescription className="mt-4">
                        Completed on {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : 'N/A'} at{' '}
                        {test.completedAt ? new Date(test.completedAt).toLocaleTimeString() : 'N/A'}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Section Scores */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Section Breakdown</CardTitle>
                    <CardDescription>Detailed scores for each test section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.entries(sectionScores).map(([section, score]) => (
                        <div key={section}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold capitalize">{section}</span>
                                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                            </div>
                            <Progress value={(score / 90) * 100} className="h-3" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Test Details */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Test Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Test Name</p>
                        <p className="font-semibold">{test.testName}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Questions Completed</p>
                        <p className="font-semibold">{test.completedQuestions} / {test.totalQuestions}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Started At</p>
                        <p className="font-semibold">
                            {test.startedAt ? new Date(test.startedAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">
                            {test.completedAt && test.startedAt
                                ? `${Math.round((new Date(test.completedAt).getTime() - new Date(test.startedAt).getTime()) / 60000)} minutes`
                                : 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
                <Button size="lg" className="flex-1" asChild>
                    <Link href={`/academic/mock-tests/${testId}/report`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Detailed Report
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>

            <Separator className="my-8" />

            {/* Navigation */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                    <Link href="/academic/mock-tests">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Mock Tests
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/academic/practice">Start Practice</Link>
                </Button>
            </div>

            {/* Test Info */}
            <div className="text-center text-sm text-muted-foreground mt-8">
                <p>Test ID: {testId}</p>
            </div>
        </div>
    );
}
