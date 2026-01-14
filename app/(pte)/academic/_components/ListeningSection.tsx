"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Headphones, ChevronRight, Info } from "lucide-react";
import ListeningAttempt from "@/components/pte/attempt/ListeningAttempt";

interface Question {
    id: string;
    type: any;
    title: string;
    promptText?: string;
    promptMediaUrl?: string;
    options?: any;
}

interface ListeningSectionProps {
    questions: Question[];
    currentQuestionIndex: number;
    onNext: () => void;
    onAnswer: (questionId: string, answer: any) => void;
}

export function ListeningSection({
    questions,
    currentQuestionIndex,
    onNext,
    onAnswer
}: ListeningSectionProps) {
    const currentQuestion = questions[currentQuestionIndex];

    const handleSubmitted = (attemptId?: string) => {
        onAnswer(currentQuestion.id, { attemptId });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Section 3: Listening
                    </h2>
                    <p className="text-gray-500">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                </div>
                <Badge variant="secondary" className="px-4 py-1 text-sm font-semibold bg-blue-50 text-blue-700 border-blue-100">
                    <span className="flex items-center gap-2">
                        <Headphones className="h-4 w-4" /> Listening Task
                    </span>
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
                            <ListeningAttempt
                                questionId={currentQuestion.id}
                                questionType={currentQuestion.type}
                                prompt={{
                                    id: currentQuestion.id,
                                    type: currentQuestion.type,
                                    title: currentQuestion.title,
                                    promptText: currentQuestion.promptText,
                                    promptMediaUrl: currentQuestion.promptMediaUrl,
                                    options: currentQuestion.options
                                }}
                                onSubmitted={handleSubmitted}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none bg-blue-600 text-white shadow-lg shadow-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="p-2 bg-white/20 rounded-lg">
                                    <Info className="h-5 w-5" />
                                </span>
                                <h3 className="font-bold">Task Instructions</h3>
                            </div>
                            <p className="text-sm text-blue-50/90 leading-relaxed">
                                Listen to the audio carefully. You usually only hear it once. Answer the question based on what you hear. Some tasks require typing, while others are multiple choice.
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
