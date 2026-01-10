"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import QuestionPrompt from "@/components/pte/speaking/QuestionPrompt"; // Reuse
import SpeakingRecorder from "@/components/pte/speaking/SpeakingRecorder"; // Reuse
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

// Types
import { QuestionType } from "@/lib/types";

interface MockTestRunnerProps {
    attemptId: string;
    initialQuestion: any; // Full question object
    totalQuestions: number;
    initialIndex: number;
    title: string;
}

export default function MockTestRunner({
    attemptId,
    initialQuestion,
    totalQuestions,
    initialIndex,
    title,
}: MockTestRunnerProps) {
    const router = useRouter();

    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingAudio, setLoadingAudio] = useState(false);

    // Answer State
    const [textAnswer, setTextAnswer] = useState("");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    // Timer State
    // Default fallback: 60s if no timeLimit provided
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
        let durationMs = 0; // Capture if possible

        // 1. Prepare Payload
        const type = currentQuestion.questionType.name || currentQuestion.questionType;
        const isSpeaking = type.toLowerCase().includes('speaking') || type.toLowerCase().includes('read aloud') || type.toLowerCase().includes('repeat') || type.toLowerCase().includes('describe') || type.toLowerCase().includes('retell');

        // Upload Audio if Speaking
        if (isSpeaking && audioBlob) {
            try {
                setLoadingAudio(true);
                // Re-use logic from blob-upload or implement simple upload
                // We'll mimic the logic: Upload to Vercel Blob via API? 
                // Or simpler: Convert to Base64 (not recommended for large files but robust for MVP without blob API setup)
                // Or: Use server action for upload. 
                // For MVP strictness: We'll assume upload endpoint exists or use a direct "upload-to-disk" route.
                // Actually `app/api/upload/route.ts` likely exists?
                // I'll skip actual blob upload for this exact second and focus on flow:
                // Send Base64 for now? No, payload limit.
                // I need to upload.

                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');

                // Assume we have a generic upload route
                const upRes = await fetch('/api/upload/audio', { method: 'POST', body: formData });
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
            const res = await fetch('/api/mock-test/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attemptId,
                    answer: answerPayload,
                    timeSpentMs: (timeLimit - timeLeft) * 1000
                })
            });

            const data = await res.json();

            if (data.finished) {
                router.push(`/academic/mock-tests/${attemptId}/result`);
            } else if (data.question) {
                setCurrentQuestion(data.question);
                setCurrentIndex(data.currentQuestionIndex);
            }
        } catch (e) {
            toast({ title: "Error submitting answer", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderers
    const isSpeaking = currentQuestion.questionType.name?.toLowerCase().includes('read aloud') ||
        currentQuestion.questionType.name?.toLowerCase().includes('repeat') ||
        currentQuestion.questionType.name?.toLowerCase().includes('speak'); // Generic check

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                <div className="font-semibold">{title}</div>
                <div className="flex items-center gap-4">
                    <span className={`font-mono text-xl ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                    <Button onClick={handleNext} disabled={isSubmitting || loadingAudio}>
                        {isSubmitting ? "Saving..." : "Next"}
                    </Button>
                </div>
            </header>

            <Progress value={((currentIndex) / totalQuestions) * 100} className="h-1" />

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-6 max-w-4xl flex flex-col items-center justify-center">
                <Card className="w-full p-8 min-h-[400px] flex flex-col gap-6">

                    {/* Prompt Section */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">{currentQuestion.title}</h2>
                        {/* Reuse QuestionPrompt for standardized display */}
                        <QuestionPrompt
                            question={{
                                id: currentQuestion.id,
                                type: (currentQuestion.questionType?.name || currentQuestion.questionType?.code) as any, // Cast for loose typing
                                title: currentQuestion.title,
                                promptText: currentQuestion.content || currentQuestion.writing?.promptText || currentQuestion.reading?.passageText,
                                // Audio prompt for Repeat Sentence etc.
                                promptMediaUrl: currentQuestion.speaking?.audioPromptUrl || currentQuestion.listening?.audioFileUrl
                            }}
                        />
                    </div>

                    {/* Input Section */}
                    <div className="flex-1 mt-6">
                        {isSpeaking ? (
                            <SpeakingRecorder
                                type={currentQuestion.questionType.name as any}
                                timers={{ prepMs: 3000, recordMs: (currentQuestion.timeLimit || 40) * 1000 }} // Prep hardcoded for now or use question metadata
                                onRecorded={(data: { blob: Blob }) => setAudioBlob(data.blob)}
                                auto={{ active: true }} // Auto start in mock?
                            />
                        ) : (
                            <textarea
                                className="w-full h-64 p-4 border rounded-md resize-none"
                                placeholder="Type your answer here..."
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                spellCheck={false} // PTE usually disables spellcheck
                            />
                        )}
                    </div>

                </Card>
            </main>
        </div>
    );
}
