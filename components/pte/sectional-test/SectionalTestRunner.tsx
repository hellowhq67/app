"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import QuestionPrompt from "@/components/pte/speaking/QuestionPrompt";
import SpeakingRecorder from "@/components/pte/speaking/SpeakingRecorder";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { QuestionType } from "@/lib/types";

// Import inputs for other types if available or use generic generic text area
// For now, we'll keep the logic similar to MockTestRunner which uses SpeakingRecorder or Textarea
// We might want to expand this to use specific inputs for Reading/Listening later

interface SectionalTestRunnerProps {
    testId: string;
    initialQuestion: any;
    totalQuestions: number;
    initialIndex: number;
    sectionTitle: string;
}

export default function SectionalTestRunner({
    testId,
    initialQuestion,
    totalQuestions,
    initialIndex,
    sectionTitle,
}: SectionalTestRunnerProps) {
    const router = useRouter();

    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingAudio, setLoadingAudio] = useState(false);

    // Answer State
    const [textAnswer, setTextAnswer] = useState("");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    // Timer State
    // Default to question time limit or 60s
    const timeLimit = currentQuestion?.timeLimit || 60;
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    useEffect(() => {
        // Reset state on new question
        setTextAnswer("");
        setAudioBlob(null);
        setTimeLeft(currentQuestion?.timeLimit || 60);
    }, [currentQuestion]);

    // Timer Tick
    useEffect(() => {
        if (timeLeft <= 0) {
            handleNext();
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev: number) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleNext = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        let answerPayload: any = {};

        // 1. Prepare Payload
        const type = currentQuestion.questionType.name || currentQuestion.questionType;
        const isSpeaking =
            type.toLowerCase().includes("speaking") ||
            type.toLowerCase().includes("read aloud") ||
            type.toLowerCase().includes("repeat") ||
            type.toLowerCase().includes("describe") ||
            type.toLowerCase().includes("retell");

        // Upload Audio if Speaking
        if (isSpeaking && audioBlob) {
            try {
                setLoadingAudio(true);
                const formData = new FormData();
                formData.append("file", audioBlob, "recording.webm");

                // Use the existing audio upload route
                const upRes = await fetch("/api/upload/audio", {
                    method: "POST",
                    body: formData,
                });
                if (upRes.ok) {
                    const { url } = await upRes.json();
                    answerPayload = { audioUrl: url };
                } else {
                    console.error("Audio upload failed, proceeding without audio url");
                    answerPayload = { error: "Audio Upload Failed" };
                }
            } catch (e) {
                console.error("Audio upload error", e);
            } finally {
                setLoadingAudio(false);
            }
        } else {
            answerPayload = { text: textAnswer };
        }

        // 2. Submit to API
        try {
            const res = await fetch("/api/sectional-test/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId,
                    answer: answerPayload,
                    timeSpentMs: (timeLimit - timeLeft) * 1000,
                    questionId: currentQuestion.id,
                }),
            });

            const data = await res.json();

            if (data.finished) {
                router.push(`/academic/sectional-test/${testId}/result`);
            } else if (data.question) {
                setCurrentQuestion(data.question);
                setCurrentIndex(data.currentQuestionIndex);
            }
        } catch (e) {
            toast({ title: "Error submitting answer", variant: "destructive" });
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const type = currentQuestion.questionType.name || currentQuestion.questionType;
    const isSpeaking =
        type.toLowerCase().includes("speaking") ||
        type.toLowerCase().includes("read aloud") ||
        type.toLowerCase().includes("repeat") ||
        type.toLowerCase().includes("describe") ||
        type.toLowerCase().includes("retell");

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                <div className="font-semibold">{sectionTitle}</div>
                <div className="flex items-center gap-4">
                    <span className={`font-mono text-xl ${timeLeft < 10 ? "text-red-500" : ""}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                    <Button onClick={handleNext} disabled={isSubmitting || loadingAudio}>
                        {isSubmitting ? "Saving..." : "Next"}
                    </Button>
                </div>
            </header>

            <Progress value={(currentIndex / totalQuestions) * 100} className="h-1" />

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-6 max-w-4xl flex flex-col items-center justify-center">
                <Card className="w-full p-8 min-h-[400px] flex flex-col gap-6">
                    {/* Prompt Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">{currentQuestion.title}</h2>
                        <QuestionPrompt
                            question={{
                                id: currentQuestion.id,
                                type: (currentQuestion.questionType?.name ||
                                    currentQuestion.questionType?.code) as any,
                                title: currentQuestion.title,
                                promptText:
                                    currentQuestion.content ||
                                    currentQuestion.writing?.promptText ||
                                    currentQuestion.reading?.passageText,
                                promptMediaUrl:
                                    currentQuestion.speaking?.audioPromptUrl ||
                                    currentQuestion.listening?.audioFileUrl,
                            }}
                        />
                    </div>

                    {/* Input Section */}
                    <div className="flex-1 mt-6">
                        {isSpeaking ? (
                            <SpeakingRecorder
                                type={currentQuestion.questionType.name as any}
                                timers={{
                                    prepMs: 3000,
                                    recordMs: (currentQuestion.timeLimit || 40) * 1000,
                                }}
                                onRecorded={(data: { blob: Blob }) => setAudioBlob(data.blob)}
                                auto={{ active: true }}
                            />
                        ) : (
                            <textarea
                                className="w-full h-64 p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Type your answer here..."
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                spellCheck={false}
                            />
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
}
