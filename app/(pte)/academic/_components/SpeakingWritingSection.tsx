"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, ChevronRight, Clock, Info } from "lucide-react";
import SpeakingAttempt from "@/components/pte/attempt/SpeakingAttempt";
import WritingAttempt from "@/components/pte/attempt/WritingAttempt";
import { cn } from "@/lib/utils";

interface Question {
    id: string;
    type: any;
    title: string;
    promptText: string;
    promptMediaUrl?: string;
}

interface SpeakingWritingSectionProps {
    questions: Question[];
    currentQuestionIndex: number;
    onNext: () => void;
    onAnswer: (questionId: string, answer: any) => void;
}

export function SpeakingWritingSection({
    questions,
    currentQuestionIndex,
    onNext,
    onAnswer
}: SpeakingWritingSectionProps) {
    const currentQuestion = questions[currentQuestionIndex];
    const isSpeaking = [
        "read_aloud",
        "repeat_sentence",
        "describe_image",
        "retell_lecture",
        "answer_short_question"
    ].includes(currentQuestion.type);

    const handleSubmitted = (attemptId?: string) => {
        onAnswer(currentQuestion.id, { attemptId });
        // In a mock test, we usually wait for the user to click "Next" 
        // unless it's the last question of the section.
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Section 1: Speaking & Writing
                    </h2>
                    <p className="text-gray-500">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                </div>
                <Badge variant="secondary" className="px-4 py-1 text-sm font-semibold">
                    {isSpeaking ? (
                        <span className="flex items-center gap-2">
                            <Mic className="h-4 w-4 text-blue-500" /> Speaking Task
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-500" /> Writing Task
                        </span>
                    )}
                </Badge>
            </div>

            <Progress
                value={((currentQuestionIndex + 1) / questions.length) * 100}
                className="h-2 w-full bg-gray-100"
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-xl shadow-gray-200/50">
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-lg font-bold text-gray-800">
                                {currentQuestion.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isSpeaking ? (
                                <SpeakingAttempt
                                    questionId={currentQuestion.id}
                                    questionType={currentQuestion.type}
                                    prompt={{
                                        title: currentQuestion.title,
                                        promptText: currentQuestion.promptText,
                                        promptMediaUrl: currentQuestion.promptMediaUrl
                                    }}
                                    onSubmitted={handleSubmitted}
                                />
                            ) : (
                                <WritingAttempt
                                    questionId={currentQuestion.id}
                                    questionType={currentQuestion.type}
                                    prompt={{
                                        title: currentQuestion.title,
                                        promptText: currentQuestion.promptText
                                    }}
                                    onSubmitted={handleSubmitted}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="h-5 w-5" />
                                <h3 className="font-bold">Task Instructions</h3>
                            </div>
                            <p className="text-sm text-blue-50/90 leading-relaxed">
                                {isSpeaking
                                    ? "Speak clearly and naturally. You have one attempt per question. The recording will stop automatically after 3 seconds of silence."
                                    : "Type your response in the box provided. Pay attention to grammar, spelling, and character limits."}
                            </p>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={onNext}
                        className="w-full h-14 rounded-xl bg-gray-900 text-lg font-bold hover:bg-black transition-all group"
                    >
                        {currentQuestionIndex === questions.length - 1 ? "Finish Section" : "Next Question"}
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                            Session Protected
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
