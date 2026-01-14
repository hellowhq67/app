'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Clock, FileText, Mic, BookOpen, Headphones, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function MockTestLandingPage() {
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);
    const [hasRead, setHasRead] = useState(false);

    const testSections = [
        {
            name: 'Speaking',
            icon: Mic,
            questionCount: '20-25 questions',
            duration: '~30 min',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            name: 'Writing',
            icon: FileText,
            questionCount: '2-3 questions',
            duration: '~40 min',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            name: 'Reading',
            icon: BookOpen,
            questionCount: '13-18 questions',
            duration: '~32 min',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            name: 'Listening',
            icon: Headphones,
            questionCount: '12-20 questions',
            duration: '~35 min',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
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
            console.log('Test started:', data);

            // Redirect to test execution page
            router.push(`/academic/mock-tests/${data.testId}`);
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
        <div className="container mx-auto max-w-5xl py-8 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    PTE Academic Full Mock Test
                </h1>
                <p className="text-muted-foreground text-lg">
                    Complete 2-hour simulated exam environment with AI scoring
                </p>
            </div>

            {/* Test Overview Card */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">Test Overview</CardTitle>
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                            <Clock className="w-4 h-4 mr-2" />
                            ~2 Hours
                        </Badge>
                    </div>
                    <CardDescription>
                        This mock test simulates the actual PTE Academic exam with 60-64 questions across 4 sections
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Section Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {testSections.map((section, idx) => {
                            const Icon = section.icon;
                            return (
                                <Card key={idx} className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${section.bgColor}`}>
                                                <Icon className={`w-6 h-6 ${section.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">{section.name}</h3>
                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                    <p>{section.questionCount}</p>
                                                    <p className="font-medium">{section.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Separator className="my-6" />

                    {/* Test Instructions */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            Important Instructions
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>Complete all sections in order - you cannot skip sections</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>Each question has a time limit - answer before time runs out</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>For speaking questions, ensure your microphone is working</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>Your progress is auto-saved - you can pause and resume</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>Results with AI feedback will be available immediately after completion</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Before you begin</AlertTitle>
                        <AlertDescription>
                            Ensure you have a stable internet connection and a quiet environment for 2 hours.
                            Headphones and a microphone are required for listening and speaking sections.
                        </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-3 w-full">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={hasRead}
                            onChange={(e) => setHasRead(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm cursor-pointer">
                            I have read and understood the test instructions
                        </label>
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg h-14"
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
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Start Full Mock Test
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Info Footer */}
            <div className="text-center text-sm text-muted-foreground">
                <p>Your test will be scored using advanced AI models for speaking and writing sections,</p>
                <p>and deterministic scoring for reading and listening sections.</p>
            </div>
        </div>
    );
}
