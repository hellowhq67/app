"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Play,
    Info,
    CheckCircle2,
    Mic,
    Headphones,
    Monitor,
    ClipboardCheck,
    Zap,
    Clock,
    ExternalLink,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypingEffect } from "@/components/ui/typing-effect";
import { MicTest } from "@/components/pte/mock-test/mic-test";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock data generator (same as main page for consistency)
const getMockTestData = (id: string) => {
    const index = parseInt(id.split("-")[1]) - 1 || 0;
    return {
        id: id,
        title: `PTE Academic Mock Test #${index + 1}`,
        type: index % 3 === 0 ? "Sectional" : "Full Mock",
        duration: index % 3 === 0 ? "45 mins" : "2 hours",
        isFree: index < 5,
        difficulty:
            index % 5 === 0
                ? "Expert"
                : index % 2 === 0
                    ? "Intermediate"
                    : "Beginner",
        questions: index % 3 === 0 ? 25 : 73,
        sections: [
            { name: "Speaking & Writing", duration: "54-67 mins", questions: 7 },
            { name: "Reading", duration: "29-30 mins", questions: 5 },
            { name: "Listening", duration: "30-43 mins", questions: 8 },
        ],
    };
};

export default function MockTestStartPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const testData = getMockTestData(id);

    const [prepStep, setPrepStep] = useState(0);
    const [isReady, setIsReady] = useState(false);

    const introductionGuide = `Welcome to the Pearson Test of English Academic simulated environment. This Mock Test is designed to mirror the actual exam conditions. You will be tested on four skills: Speaking, Writing, Reading, and Listening. 

Important Reminders:
- Ensure you are in a quiet environment.
- Use a high-quality headset with a dedicated microphone.
- Do not refresh the browser once the test begins.
- Respond quickly; for speaking tasks, the recording stops after 3 seconds of silence.
- Monitor your time carefully using the on-screen timer.`;

    const checklist = [
        { id: 1, text: "Stable internet connection verified", icon: Zap },
        { id: 2, text: "High-quality headset connected", icon: Headphones },
        { id: 3, text: "Webcam/Monitor visibility check", icon: Monitor },
        { id: 4, text: "Quiet environment confirmed", icon: ShieldCheck },
    ];

    const handleToggleCheck = (index: number) => {
        if (index === prepStep) {
            setPrepStep((prev) => prev + 1);
        }
    };

    useEffect(() => {
        if (prepStep >= checklist.length) {
            setIsReady(true);
        }
    }, [prepStep, checklist.length]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Navigation Header */}
            <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/academic/moktest")}
                        className="gap-2 text-gray-600 hover:text-blue-600"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="border-blue-100 bg-blue-50 text-blue-700 font-bold"
                        >
                            {testData.type}
                        </Badge>
                        {testData.isFree ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                                FREE ACCESS
                            </Badge>
                        ) : (
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                                VIP CONTENT
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Hero Section */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                        {testData.title}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <span>{testData.duration} Total Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-purple-500" />
                            <span>{testData.questions} Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            <span>{testData.difficulty} Level</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Instructions and Typing Guide */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Info className="h-5 w-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Introduction & Instructions
                                </h2>
                            </div>
                            <TypingEffect
                                text={introductionGuide}
                                speed={20}
                                delay={500}
                                className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap"
                            />
                        </div>

                        {/* Test Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testData.sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                                >
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {section.name}
                                    </h3>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Duration:</span>
                                            <span className="font-semibold text-gray-700">
                                                {section.duration}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Modules:</span>
                                            <span className="font-semibold text-gray-700">
                                                {section.questions} Tasks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Pre-test Actions */}
                    <div className="space-y-8">
                        {/* Mic Test Component */}
                        <MicTest />

                        {/* Preparation Checklist */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Pre-test Checklist
                                </h2>
                                <span className="text-sm font-bold text-blue-600">
                                    {Math.round((prepStep / checklist.length) * 100)}%
                                </span>
                            </div>

                            <Progress
                                value={(prepStep / checklist.length) * 100}
                                className="h-2 mb-8"
                            />

                            <div className="space-y-4">
                                {checklist.map((item, idx) => {
                                    const Icon = item.icon;
                                    const isCompleted = idx < prepStep;
                                    const isCurrent = idx === prepStep;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleToggleCheck(idx)}
                                            disabled={!isCurrent && !isCompleted}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                                                isCompleted
                                                    ? "bg-green-50 border-green-100"
                                                    : isCurrent
                                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                                        : "bg-gray-50 border-gray-100 opacity-50 grayscale"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg",
                                                    isCompleted
                                                        ? "bg-green-100 text-green-600"
                                                        : isCurrent
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-gray-200 text-gray-400"
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <span
                                                className={cn(
                                                    "font-semibold",
                                                    isCompleted
                                                        ? "text-green-800"
                                                        : isCurrent
                                                            ? "text-blue-900"
                                                            : "text-gray-400"
                                                )}
                                            >
                                                {item.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8">
                                <Link href={`/academic/moktest/start/${id}`}>
                                    <Button
                                        disabled={!isReady}
                                        className={cn(
                                            "w-full h-14 rounded-xl text-lg font-black transition-all shadow-lg",
                                            isReady
                                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]"
                                                : "bg-gray-200 text-gray-400"
                                        )}
                                    >
                                        {isReady ? (
                                            <>
                                                <Play className="mr-2 h-6 w-6 fill-current" />
                                                BEGIN PRACTICE TEST
                                            </>
                                        ) : (
                                            "COMPLETE ALL STEPS"
                                        )}
                                    </Button>
                                </Link>
                                <p className="mt-4 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
                                    Your session will be saved automatically
                                </p>
                            </div>
                        </div>

                        {/* Resources Support Card */}
                        <div className="rounded-2xl bg-gray-900 p-6 text-white text-center">
                            <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                            <p className="text-gray-400 text-sm mb-4">
                                Read our comprehensive guide to score 79+ in your first attempt.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent hover:bg-white/10 border-gray-700 text-white gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Guide to PTE Success
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
