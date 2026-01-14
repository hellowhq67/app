"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SpeakingWritingSection } from "./SpeakingWritingSection";
import { ReadingSection } from "./ReadingSection";
import { ListeningSection } from "./ListeningSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Save, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface Question {
    id: string;
    type: string;
    title: string;
    promptText: string;
    promptMediaUrl?: string;
    options?: any;
}

export interface TestSection {
    name: string;
    questions: Question[];
    duration: number; // in seconds
}

export interface FullMockTest {
    id: string;
    title: string;
    sections: TestSection[];
}

interface MockTestClientProps {
    testData: FullMockTest;
}

export function MockTestClient({ testData }: MockTestClientProps) {
    const router = useRouter();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState(testData.sections[0].duration);
    const [isFinished, setIsFinished] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const currentSection = testData.sections[currentSectionIndex];

    const handleSectionFinish = () => {
        if (currentSectionIndex < testData.sections.length - 1) {
            const nextIndex = currentSectionIndex + 1;
            setCurrentSectionIndex(nextIndex);
            setCurrentQuestionIndex(0);
            setTimeLeft(testData.sections[nextIndex].duration);
        } else {
            setIsFinished(true);
        }
    };

    // Timer logic
    useEffect(() => {
        if (isFinished || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSectionFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isFinished, currentSectionIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswer = (questionId: string, answer: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentSection.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSectionFinish();
        }
    };

    const handleSubmitTest = () => {
        // Here you would typically send the answers to your API
        console.log("Submitting test results:", {
            testId: testData.id,
            answers
        });

        // Redirect to result page (placeholder)
        router.push(`/academic/moktest/result/${testData.id}`);
    };

    if (isFinished) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-20 flex flex-col items-center text-center space-y-8">
                <div className="rounded-full bg-green-100 p-6 text-green-600 animate-bounce">
                    <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-gray-900 italic">CONGRATULATIONS!</h1>
                    <p className="text-xl text-gray-500 font-medium">
                        You have successfully completed the {testData.title}.
                    </p>
                    <p className="text-gray-400">
                        Your test has been submitted for AI evaluation. Your results will be available in less than 5 minutes.
                    </p>
                </div>
                <Button
                    onClick={handleSubmitTest}
                    className="h-14 px-10 rounded-2xl bg-blue-600 text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105"
                >
                    View Your Detailed Report
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Professional Runner Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm px-4 h-16 sm:h-20 flex items-center shrink-0">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 pr-4 border-r">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <span className="font-black text-xs">PTE</span>
                            </div>
                            <span className="font-bold text-gray-900 tracking-tight">EXAM RUNNER</span>
                        </div>
                        <h1 className="text-sm sm:text-lg font-black text-gray-900 truncate max-w-[150px] sm:max-w-none italic">
                            {testData.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        <div className={cn(
                            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 transition-colors",
                            timeLeft < 300 ? "border-red-200 bg-red-50 text-red-600" : "border-blue-100 bg-blue-50 text-blue-700"
                        )}>
                            <Clock className={cn("h-4 w-4 sm:h-5 sm:w-5", timeLeft < 300 && "animate-pulse")} />
                            <span className="font-mono text-base sm:text-xl font-black">
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowExitConfirm(true)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Section Progress</span>
                        <div className="flex gap-1.5">
                            {testData.sections.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "h-1.5 w-8 rounded-full transition-all",
                                        idx === currentSectionIndex ? "bg-blue-600" :
                                            idx < currentSectionIndex ? "bg-green-500" : "bg-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Render Section Components */}
                {currentSectionIndex === 0 && (
                    <SpeakingWritingSection
                        questions={currentSection.questions}
                        currentQuestionIndex={currentQuestionIndex}
                        onNext={handleNext}
                        onAnswer={handleAnswer}
                    />
                )}
                {currentSectionIndex === 1 && (
                    <ReadingSection
                        questions={currentSection.questions}
                        currentQuestionIndex={currentQuestionIndex}
                        onNext={handleNext}
                        onAnswer={handleAnswer}
                    />
                )}
                {currentSectionIndex === 2 && (
                    <ListeningSection
                        questions={currentSection.questions}
                        currentQuestionIndex={currentQuestionIndex}
                        onNext={handleNext}
                        onAnswer={handleAnswer}
                    />
                )}
            </main>

            {/* Exit Confirmation Dialog */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="max-w-md w-full border-none shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardContent className="pt-8 text-center space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 italic">QUIT PRACTICE TEST?</h3>
                                <p className="text-gray-500 font-medium">
                                    Your progress in this section will be lost and you will not receive a score report.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl font-bold border-gray-200"
                                    onClick={() => setShowExitConfirm(false)}
                                >
                                    STAY AND FINISH
                                </Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold"
                                    onClick={() => router.push("/academic/moktest")}
                                >
                                    EXIT TEST
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
