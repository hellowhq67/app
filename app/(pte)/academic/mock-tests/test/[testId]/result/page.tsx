export const dynamic = 'force-dynamic';

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
import {
    CheckCircle2, Download, Eye, Trophy, Home,
    Mic, FileText, BookOpen, Headphones, Clock, ArrowRight, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

function getScoreBand(score: number): { label: string; color: string; textColor: string; borderColor: string } {
    if (score >= 80) return { label: 'Expert', color: 'bg-green-500', textColor: 'text-green-600', borderColor: 'border-green-200' };
    if (score >= 65) return { label: 'Proficient', color: 'bg-blue-500', textColor: 'text-blue-600', borderColor: 'border-blue-200' };
    if (score >= 36) return { label: 'Developing', color: 'bg-amber-500', textColor: 'text-amber-600', borderColor: 'border-amber-200' };
    return { label: 'Needs Improvement', color: 'bg-red-500', textColor: 'text-red-600', borderColor: 'border-red-200' };
}

function formatDuration(startedAt: Date | null, completedAt: Date | null): string {
    if (!startedAt || !completedAt) return 'N/A';
    const mins = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);
    if (mins < 60) return `${mins} minutes`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const sectionMeta = {
    speaking: { icon: Mic, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-200', bar: '[&>div]:bg-blue-500', practice: '/academic/practice/speaking' },
    writing: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-200', bar: '[&>div]:bg-amber-500', practice: '/academic/practice/writing' },
    reading: { icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-200', bar: '[&>div]:bg-emerald-500', practice: '/academic/practice/reading' },
    listening: { icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-200', bar: '[&>div]:bg-purple-500', practice: '/academic/practice/listening' },
};

export default async function MockTestResultPage({
    params,
}: {
    params: Promise<{ testId: string }>;
}) {
    const { testId } = await params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        redirect('/sign-in');
    }

    const test = await db.query.pteMockTests.findFirst({
        where: and(eq(pteMockTests.id, testId), eq(pteMockTests.userId, session.user.id)),
    });

    if (!test) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Test Not Found</h1>
                <p className="text-muted-foreground">This test does not exist or you don&apos;t have access to it.</p>
                <Button className="mt-6" asChild>
                    <Link href="/academic/mock-tests">Back to Mock Tests</Link>
                </Button>
            </div>
        );
    }

    if (test.status !== 'completed') {
        redirect(`/academic/mock-tests/test/${testId}`);
    }

    const overallScore = test.overallScore || 0;
    const band = getScoreBand(overallScore);

    const sectionScores: Record<string, number> = {
        speaking: test.speakingScore || 0,
        writing: test.writingScore || 0,
        reading: test.readingScore || 0,
        listening: test.listeningScore || 0,
    };

    // Find weakest section for recommendations
    const weakestSection = Object.entries(sectionScores).sort((a, b) => a[1] - b[1])[0][0];

    const completedAt = test.completedAt ? new Date(test.completedAt) : null;
    const startedAt = test.startedAt ? new Date(test.startedAt) : null;

    return (
        <div className="container mx-auto max-w-4xl py-8 sm:py-12 px-4 space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Test Complete!</h1>
                    <p className="text-muted-foreground mt-1">
                        {completedAt
                            ? `Completed on ${completedAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                            : 'Congratulations on completing your PTE Academic Mock Test'}
                    </p>
                </div>
            </div>

            {/* Overall Score */}
            <Card className={`border-2 ${band.borderColor}`}>
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-7xl font-bold ${band.textColor}`}>{overallScore}</span>
                                <span className="text-2xl text-muted-foreground">/90</span>
                            </div>
                            <Badge className={`mt-2 ${band.color} text-white border-0`}>
                                <Trophy className="w-3 h-3 mr-1" />
                                {band.label}
                            </Badge>
                        </div>

                        <Separator orientation="vertical" className="hidden sm:block h-24" />
                        <Separator className="sm:hidden" />

                        <div className="flex-1 grid grid-cols-2 gap-3 w-full sm:w-auto">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold">{test.completedQuestions}/{test.totalQuestions}</p>
                                <p className="text-xs text-muted-foreground">Questions Done</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold">{formatDuration(startedAt, completedAt)}</p>
                                <p className="text-xs text-muted-foreground">Total Duration</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold">{startedAt ? startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                                <p className="text-xs text-muted-foreground">Started</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-lg font-bold">{completedAt ? completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                                <p className="text-xs text-muted-foreground">Finished</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section Breakdown */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3Icon />
                        Section Breakdown
                    </CardTitle>
                    <CardDescription>Score out of 90 per section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {(Object.entries(sectionScores) as [keyof typeof sectionMeta, number][]).map(([section, score]) => {
                        const meta = sectionMeta[section];
                        const Icon = meta.icon;
                        const sectionBand = getScoreBand(score);
                        return (
                            <div key={section} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-md ${meta.bg}`}>
                                            <Icon className={`w-4 h-4 ${meta.color}`} />
                                        </div>
                                        <span className="font-medium capitalize">{section}</span>
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sectionBand.textColor}`}>
                                            {sectionBand.label}
                                        </Badge>
                                    </div>
                                    <span className={`text-xl font-bold ${sectionBand.textColor}`}>{score}</span>
                                </div>
                                <Progress value={(score / 90) * 100} className={`h-2.5 ${meta.bar}`} />
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Recommended Next Steps
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Your weakest section is <span className="font-semibold capitalize text-foreground">{weakestSection}</span>.
                        Focus on targeted practice to improve your overall band score.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="default" asChild>
                            <Link href={sectionMeta[weakestSection as keyof typeof sectionMeta]?.practice || '/academic/practice'}>
                                Practice {weakestSection.charAt(0).toUpperCase() + weakestSection.slice(1)}
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/academic/mock-tests">
                                Retake Mock Test
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
                <Button size="lg" className="h-12" asChild>
                    <Link href={`/academic/mock-tests/test/${testId}/report`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Detailed Report
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                </Button>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/academic/mock-tests">
                        <Home className="w-4 h-4 mr-2" />
                        Mock Tests Home
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/analytics">
                        <Clock className="w-4 h-4 mr-2" />
                        View All Progress
                    </Link>
                </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">Test ID: {testId}</p>
        </div>
    );
}

// Inline icon to avoid import issue
function BarChart3Icon() {
    return (
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}
