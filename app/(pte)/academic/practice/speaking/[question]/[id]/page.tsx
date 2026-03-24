export const dynamic = 'force-dynamic';

import React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getQuestionById, getUserPracticeStatus } from "@/lib/pte/practice";
import { AccessGate } from "@/components/pte/AccessGate";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, BarChart, ChevronRight, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SpeakingPracticeClient } from "@/components/pte/speaking/speaking-client";
import { SpeakingQuestion } from "@/lib/types";

// Format question type for display
function formatQuestionType(type: string): string {
    return type
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default async function QuestionPage({
    params,
}: {
    params: Promise<{ question: string; id: string }>;
}) {
    const { question, id } = await params;
    // 1. Get Session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // 2. Fetch Data
    const questionData = await getQuestionById(id) as SpeakingQuestion;
    if (!questionData) {
        notFound();
    }

    // 3. Fetch User Status for Gate
    let userTier: "free" | "basic" | "premium" | "unlimited" = "free";
    if (session?.user?.id) {
        const userStatus = await getUserPracticeStatus(session.user.id);
        if (userStatus?.subscriptionTier) {
            userTier = userStatus.subscriptionTier as any;
        }
    }

    const questionTypeName = formatQuestionType(question);

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
                <Link href="/academic" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <Home className="size-3.5" />
                    Dashboard
                </Link>
                <ChevronRight className="size-3" />
                <Link href="/academic/practice" className="hover:text-foreground transition-colors">
                    Practice
                </Link>
                <ChevronRight className="size-3" />
                <Link href="/academic/practice/speaking" className="hover:text-foreground transition-colors">
                    Speaking
                </Link>
                <ChevronRight className="size-3" />
                <Link href={`/academic/practice/speaking/${question}`} className="hover:text-foreground transition-colors">
                    {questionTypeName}
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground font-medium truncate max-w-[200px]">
                    {questionData.title || `Question #${id.slice(-6)}`}
                </span>
            </nav>

            {/* Header with Back Button and Premium Badge */}
            <div className="flex items-center justify-between">
                <Link href={`/academic/practice/speaking/${question}`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground"
                    >
                        <ArrowLeft className="size-4" /> Back to list
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    {questionData.isPremium && (
                        <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 gap-1"
                        >
                            Premium Question
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Wrapped in AccessGate */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{questionData.title}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Clock className="size-3" /> 20 mins
                            </span>
                            <span className="flex items-center gap-1">
                                <BarChart className="size-3" /> {questionData.difficulty}
                            </span>
                        </p>
                    </div>

                    <AccessGate isPremium={questionData.isPremium} userTier={userTier}>
                        <div className="bg-white dark:bg-[#1e1e20] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[400px]">
                            {/* Question Content */}
                            <div className="prose dark:prose-invert max-w-none mb-8">
                                <h3 className="text-lg font-semibold mb-2">Question Text</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                    {questionData.content ||
                                        "No content available for this question."}
                                </p>
                            </div>

                            {/* Practice UI Area */}
                            <SpeakingPracticeClient
                                question={questionData}
                            />
                        </div>
                    </AccessGate>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                            Tips & Tricks
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            Remember to speak clearly and at a natural pace. Avoid long pauses
                            and try to mimic the intonation of native speakers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
