'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    Clock, FileText, Mic, BookOpen, Headphones, CheckCircle2, AlertCircle,
    Loader2, Play, ArrowRight, Sparkles, Timer, Target, Trophy, Zap,
    TrendingUp, Shield, BarChart3, History
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const testSections = [
    {
        name: 'Speaking',
        icon: Mic,
        questionCount: '20-25',
        duration: '~30 min',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        dotColor: 'bg-blue-500',
        progressColor: '[&>div]:bg-blue-500',
        progress: 30,
        types: ['Read Aloud', 'Repeat Sentence', 'Describe Image', 'Re-tell Lecture', 'Answer Short Question'],
    },
    {
        name: 'Writing',
        icon: FileText,
        questionCount: '2-3',
        duration: '~40 min',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        dotColor: 'bg-amber-500',
        progressColor: '[&>div]:bg-amber-500',
        progress: 33,
        types: ['Summarize Written Text', 'Write Essay'],
    },
    {
        name: 'Reading',
        icon: BookOpen,
        questionCount: '13-18',
        duration: '~32 min',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        dotColor: 'bg-emerald-500',
        progressColor: '[&>div]:bg-emerald-500',
        progress: 27,
        types: ['Multiple Choice', 'Re-order Paragraphs', 'Fill in the Blanks'],
    },
    {
        name: 'Listening',
        icon: Headphones,
        questionCount: '12-20',
        duration: '~35 min',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        dotColor: 'bg-purple-500',
        progressColor: '[&>div]:bg-purple-500',
        progress: 29,
        types: ['Summarize Spoken Text', 'Multiple Choice', 'Fill in Blanks', 'Write from Dictation'],
    },
];

const features = [
    { icon: Sparkles, title: 'AI-Powered Scoring', desc: 'Instant feedback via Gemini', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Timer, title: 'Real Exam Timing', desc: 'Authentic time pressure', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Target, title: 'Detailed Feedback', desc: 'Per-question analysis', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: BarChart3, title: 'Score Prediction', desc: 'Band-based reporting', color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const scoreBands = [
    { label: 'Expert', range: '80–90', color: 'bg-green-500', width: 'w-[100%]' },
    { label: 'Proficient', range: '65–79', color: 'bg-blue-500', width: 'w-[88%]' },
    { label: 'Developing', range: '36–64', color: 'bg-amber-500', width: 'w-[71%]' },
    { label: 'Needs Work', range: '10–35', color: 'bg-red-500', width: 'w-[39%]' },
];

export default function MockTestLandingPage() {
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);
    const [hasRead, setHasRead] = useState(false);

    const handleStartTest = async () => {
        setIsStarting(true);
        try {
            const res = await fetch('/api/mock-test/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to start test');
            }

            const data = await res.json();
            router.push(`/academic/mock-tests/test/${data.testId}`);
        } catch (e: any) {
            console.error('Start test error:', e);
            toast({
                title: 'Error',
                description: e.message || 'Failed to start mock test. Please try again.',
                variant: 'destructive',
            });
            setIsStarting(false);
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="container mx-auto max-w-5xl py-6 sm:py-10 px-4 space-y-8"
        >
            {/* Header */}
            <motion.div variants={item} className="text-center space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Zap className="w-3 h-3 mr-1" />
                    Full Exam Simulation
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    PTE Academic{' '}
                    <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        Mock Test
                    </span>
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                    2-hour full simulation with AI scoring across all four sections.
                    Mirrors the real PTE Academic exam structure.
                </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <div key={i} className={cn('rounded-xl border p-3 sm:p-4 flex flex-col gap-2', f.bg, 'border-border/50')}>
                            <Icon className={cn('w-5 h-5', f.color)} />
                            <p className="font-semibold text-sm leading-tight">{f.title}</p>
                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                    );
                })}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Test Card */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="border-2 shadow-lg h-full">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl">Test Overview</CardTitle>
                                    <CardDescription className="mt-1">60–64 questions across 4 sections</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-sm px-3 py-1.5 border-2 w-fit">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    ~2 Hours
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {/* Section Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {testSections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <div
                                            key={section.name}
                                            className={cn(
                                                'rounded-xl border-2 p-3 sm:p-4 transition-all hover:shadow-sm',
                                                section.borderColor
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={cn('p-2 rounded-lg', section.bgColor)}>
                                                    <Icon className={cn('w-4 h-4', section.color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm">{section.name}</span>
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                            {section.questionCount}Q
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{section.duration}</p>
                                                </div>
                                            </div>
                                            <Progress
                                                value={section.progress}
                                                className={cn('h-1.5 mb-2', section.progressColor)}
                                            />
                                            <div className="flex flex-wrap gap-1">
                                                {section.types.slice(0, 3).map((type) => (
                                                    <span
                                                        key={type}
                                                        className="text-[9px] text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                                {section.types.length > 3 && (
                                                    <span className="text-[9px] text-muted-foreground/60">
                                                        +{section.types.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Separator />

                            {/* Instructions */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-amber-500" />
                                    Important Instructions
                                </h3>
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    {[
                                        'Complete all sections in order — you cannot skip sections',
                                        'Each question has a time limit — answer before time runs out',
                                        'For speaking, ensure your microphone is working before you start',
                                        'Progress is auto-saved — you can pause and resume anytime',
                                        'AI feedback and scores are available immediately after completion',
                                    ].map((instr, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                                            {instr}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pt-2">
                            <Alert className="bg-amber-500/5 border-amber-500/20">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <AlertTitle className="text-sm">Before you begin</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Ensure a stable internet connection, quiet environment, and working headphones and microphone.
                                </AlertDescription>
                            </Alert>

                            <div className="flex items-start gap-3 w-full">
                                <Checkbox
                                    id="terms"
                                    checked={hasRead}
                                    onCheckedChange={(v) => setHasRead(!!v)}
                                    className="mt-0.5"
                                />
                                <label htmlFor="terms" className="text-xs sm:text-sm cursor-pointer leading-snug">
                                    I have read and understood the test instructions and I am ready to begin.
                                </label>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-12 text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md"
                                disabled={!hasRead || isStarting}
                                onClick={handleStartTest}
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating Your Test...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Full Mock Test
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={item} className="space-y-4">
                    {/* Score Band Reference */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                Score Bands
                            </CardTitle>
                            <CardDescription className="text-xs">PTE Academic scoring scale (10–90)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {scoreBands.map((band) => (
                                <div key={band.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">{band.label}</span>
                                        <span className="text-muted-foreground">{band.range}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full', band.color, band.width)} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Test Statistics
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                {[
                                    { label: 'Questions', value: '60–64' },
                                    { label: 'Duration', value: '~2 hrs' },
                                    { label: 'Sections', value: '4' },
                                    { label: 'Max Score', value: '90' },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-background rounded-lg p-2">
                                        <p className="text-base font-bold">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Not Ready CTA */}
                    <Card className="border-dashed">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <History className="w-4 h-4 text-muted-foreground" />
                                Not ready yet?
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Practice individual sections first to build confidence.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href="/academic/sectional-test">
                                    Try Sectional Tests
                                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Footer Note */}
            <motion.div variants={item} className="text-center text-xs text-muted-foreground pb-2">
                AI scoring for speaking & writing &bull; Deterministic scoring for reading & listening &bull; Results available instantly
            </motion.div>
        </motion.div>
    );
}
