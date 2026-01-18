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
import {
    Clock, FileText, Mic, BookOpen, Headphones, CheckCircle2, AlertCircle,
    Loader2, Play, ArrowRight, Sparkles, Timer, Target, Trophy, Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function MockTestLandingPage() {
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);
    const [hasRead, setHasRead] = useState(false);

    const testSections = [
        {
            name: 'Speaking',
            icon: Mic,
            questionCount: '20-25',
            duration: '~30 min',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
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
            types: ['Summarize Spoken Text', 'Multiple Choice', 'Fill in Blanks', 'Write from Dictation'],
        },
    ];

    const features = [
        { icon: Sparkles, text: 'AI-Powered Scoring', color: 'text-primary' },
        { icon: Timer, text: 'Real Exam Timing', color: 'text-blue-500' },
        { icon: Target, text: 'Detailed Feedback', color: 'text-emerald-500' },
        { icon: Trophy, text: 'Score Prediction', color: 'text-amber-500' },
    ];

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
            className="container mx-auto max-w-5xl py-6 sm:py-10 px-4"
        >
            {/* Header */}
            <motion.div variants={item} className="text-center mb-8">
                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                    <Zap className="w-3 h-3 mr-1" />
                    Full Mock Test Experience
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                    PTE Academic{' '}
                    <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        Mock Test
                    </span>
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                    Complete 2-hour simulated exam with AI scoring across all 4 sections.
                    Experience real exam conditions.
                </p>
            </motion.div>

            {/* Features Row */}
            <motion.div variants={item} className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8">
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Icon className={cn("w-4 h-4", feature.color)} />
                            <span>{feature.text}</span>
                        </div>
                    );
                })}
            </motion.div>

            {/* Main Card */}
            <motion.div variants={item}>
                <Card className="border-2 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl sm:text-2xl">Test Overview</CardTitle>
                                <CardDescription className="mt-1">
                                    60-64 questions across 4 sections
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-base sm:text-lg px-4 py-2 border-2 w-fit">
                                <Clock className="w-4 h-4 mr-2" />
                                ~2 Hours
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Section Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {testSections.map((section, idx) => {
                                const Icon = section.icon;
                                return (
                                    <Card
                                        key={idx}
                                        className={cn(
                                            "group border-2 transition-all hover:shadow-md",
                                            section.borderColor
                                        )}
                                    >
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className={cn(
                                                    "p-2.5 sm:p-3 rounded-xl",
                                                    section.bgColor
                                                )}>
                                                    <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", section.color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h3 className="font-semibold text-base sm:text-lg">{section.name}</h3>
                                                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                                            {section.questionCount} Qs
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                                        {section.duration}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {section.types.slice(0, 3).map((type, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-[9px] sm:text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded"
                                                            >
                                                                {type}
                                                            </span>
                                                        ))}
                                                        {section.types.length > 3 && (
                                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">
                                                                +{section.types.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <Separator />

                        {/* Instructions */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                Important Instructions
                            </h3>
                            <ul className="grid gap-2 text-xs sm:text-sm text-muted-foreground">
                                {[
                                    'Complete all sections in order - you cannot skip sections',
                                    'Each question has a time limit - answer before time runs out',
                                    'For speaking questions, ensure your microphone is working',
                                    'Your progress is auto-saved - you can pause and resume',
                                    'Results with AI feedback available immediately after completion',
                                ].map((instruction, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                        <span>{instruction}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <Alert className="bg-amber-500/5 border-amber-500/20">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <AlertTitle className="text-sm">Before you begin</AlertTitle>
                            <AlertDescription className="text-xs sm:text-sm">
                                Ensure you have a stable internet, quiet environment, headphones and microphone ready.
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center gap-3 w-full">
                            <Checkbox
                                id="terms"
                                checked={hasRead}
                                onCheckedChange={(checked) => setHasRead(checked === true)}
                            />
                            <label htmlFor="terms" className="text-xs sm:text-sm cursor-pointer select-none">
                                I have read and understood the test instructions
                            </label>
                        </div>

                        <Button
                            size="lg"
                            className="w-full text-base sm:text-lg h-12 sm:h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
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

            {/* Alternative Options */}
            <motion.div variants={item} className="mt-8">
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold mb-1">Not ready for a full test?</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Try sectional tests to practice specific skills first.
                                </p>
                            </div>
                            <Button variant="outline" asChild className="w-full sm:w-auto">
                                <Link href="/academic/sectional-test">
                                    Try Sectional Tests
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Info Footer */}
            <motion.div variants={item} className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
                <p>AI scoring for speaking & writing • Deterministic scoring for reading & listening</p>
            </motion.div>
        </motion.div>
    );
}
