"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Info } from "lucide-react";
import ReadingAttempt from "@/components/pte/attempt/ReadingAttempt";

interface Question {
    id: string;
    type: any;
    title: string;
    promptText: string;
    options?: any;
}

interface ReadingSectionProps {
    questions: Question[];
    currentQuestionIndex: number;
    onNext: () => void;
    onAnswer: (questionId: string, answer: any) => void;
}

export function ReadingSection({
    questions,
    currentQuestionIndex,
    onNext,
    onAnswer
}: ReadingSectionProps) {
    const currentQuestion = questions[currentQuestionIndex];

    const handleSubmitted = (attemptId?: string) => {
        onAnswer(currentQuestion.id, { attemptId });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Section 2: Reading
                    </h2>
                    <p className="text-gray-500">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                </div>
                <Badge variant="secondary" className="px-4 py-1 text-sm font-semibold bg-emerald-50 text-emerald-700 border-emerald-100">
                    <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Reading Task
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
                            <ReadingAttempt
                                questionId={currentQuestion.id}
                                questionType={currentQuestion.type}
                                prompt={{
                                    id: currentQuestion.id,
                                    type: currentQuestion.type,
                                    title: currentQuestion.title,
                                    promptText: currentQuestion.promptText,
                                    options: currentQuestion.options
                                }}
                                onSubmitted={handleSubmitted}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="h-5 w-5" />
                                <h3 className="font-bold">Task Instructions</h3>
                            </div>
                            <p className="text-sm text-emerald-50/90 leading-relaxed">
                                Read the text and answer the question according to the specific task type. You can navigate between questions if needed (though usually mock tests follow a strict sequence).
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
