"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import QuestionPrompt from "@/components/pte/speaking/QuestionPrompt";
import { SpeakingRecorder } from "@/components/pte/speaking/SpeakingRecorder";
import ReadingInput from "@/components/pte/reading/ReadingInput";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2, Timer, AlertTriangle } from "lucide-react";

// Types
import { QuestionType } from "@/lib/types";

interface MockTestRunnerProps {
    attemptId: string;
    initialQuestion: any;
    totalQuestions: number;
    initialIndex: number;
    title: string;
    initialSectionTitle: string;
}

export default function MockTestRunner({
    attemptId,
    initialQuestion,
    totalQuestions,
    initialIndex,
    title,
    initialSectionTitle,
}: MockTestRunnerProps) {
    const router = useRouter();

    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [sectionTitle, setSectionTitle] = useState(initialSectionTitle);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Answer State
    const [answerData, setAnswerData] = useState<any>(null);

    // Timer State
    const timeLimit = currentQuestion?.timeLimit || 120; // Default 2 mins if missing
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [totalElapsed, setTotalElapsed] = useState(0);

    // Strict Mode: Prevent Back Button
    useEffect(() => {
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
            toast({
                title: "Navigation Locked",
                description: "You cannot go back during a mock test.",
                variant: "destructive",
            });
        };
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Timer Logic
    useEffect(() => {
        setTimeLeft(currentQuestion?.timeLimit || 60);
        setAnswerData(null); // Reset answer on new question
    }, [currentQuestion]);

    useEffect(() => {
        if (timeLeft <= 0) {
            // Auto submit when time runs out
            handleNext("timeout");
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((prev: number) => prev - 1);
            setTotalElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleNext = async (reason: string = "manual") => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        console.log(
            `[MockTest] Submitting Question ${currentIndex + 1
            }/${totalQuestions} Reason: ${reason}`
        );

        let payload: any = {};
        const qType =
            currentQuestion.questionType.name || currentQuestion.questionType;
        const normalizedType = qType.toLowerCase();

        // Prepare Payload based on Type
        if (normalizedType.includes("speaking")) {
            // SpeakingRecorder uploads independently or passes blob?
            // If we have answerData from SpeakingRecorder (audioUrl), use it.
            // If we just recorded it:
            if (answerData?.audioUrl) {
                payload = { audioUrl: answerData.audioUrl };
            } else if (answerData?.blob) {
                // Upload Blob here if not done
                try {
                    const formData = new FormData();
                    formData.append("file", answerData.blob, "recording.webm");
                    // Mock upload or real
                    // const upRes = await fetch('/api/upload', ...);
                    // For now, assuming we handled it or send placeholder
                    console.log("Uploading Audio Blob size:", answerData.blob.size);
                    payload = {
                        error: "Audio Upload Simulated - Production requires endpoint",
                    };
                } catch (e) {
                    console.error(e);
                }
            } else {
                payload = { error: "No Audio Recorded" };
            }
        } else if (normalizedType.includes("reading")) {
            // ReadingInput returns structured data
            payload = answerData;
        } else {
            // Default Text
            payload = { text: answerData?.text || answerData };
        }

        console.log("Submission Payload:", JSON.stringify(payload, null, 2));

        try {
            const res = await fetch("/api/mock-test/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId: attemptId, // This is actually testId
                    questionId: currentQuestion.id,
                    answer: payload,
                    timeSpentMs: (timeLimit - timeLeft) * 1000,
                }),
            });

            const data = await res.json();
            console.log("Submission Response:", data);

            if (data.completed || data.testCompleted) {
                console.log("Test Completed. Redirecting to results...");
                router.push(`/academic/mock-tests/${attemptId}/result`);
            } else if (data.nextQuestion) {
                // Update to next question
                setCurrentQuestion(data.nextQuestion);
                setCurrentIndex((prev) => prev + 1);

                // Check for section change
                if (data.sectionChanged) {
                    setSectionTitle(data.nextSection || "Next Section");
                    toast({
                        title: "Section Changed",
                        description: `Now starting: ${data.nextSection}`,
                    });
                }
            } else {
                console.error("Unexpected response format:", data);
                toast({
                    title: "Error",
                    description: "Unexpected response from server",
                    variant: "destructive",
                });
            }
        } catch (e) {
            console.error("Submission Error:", e);
            toast({
                title: "Error",
                description: "Failed to submit answer",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Logic
    const qName = currentQuestion.questionType.name?.toLowerCase() || "";
    const isSpeaking =
        qName.includes("speaking") ||
        qName.includes("read aloud") ||
        qName.includes("repeat") ||
        qName.includes("image") ||
        qName.includes("lecture") ||
        qName.includes("answer short") ||
        qName.includes("respond") ||
        qName.includes("discussion");
    const isReading = qName.includes("reading") && !qName.includes("writing"); // Pure reading
    const isReadingWriting =
        qName.includes("reading") && qName.includes("writing"); // FIB RW
    const isWriting =
        qName === "write essay" || qName === "summarize written text";

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans select-none">
            {/* Header / StatusBar */}
            <div className="bg-card border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
                <div>
                    <h1 className="font-bold text-lg">{title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {sectionTitle} — Question {currentIndex + 1} of {totalQuestions}
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timers */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-sm font-mono font-medium">
                            <Timer className="w-4 h-4" />
                            <span>
                                Question: {Math.floor(timeLeft / 60)}:
                                {(timeLeft % 60).toString().padStart(2, "0")}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                            Total Elapsed: {Math.floor(totalElapsed / 60)}m{" "}
                            {totalElapsed % 60}s
                        </div>
                    </div>

                    <Button onClick={() => handleNext("user")} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Next"
                        )}
                    </Button>
                </div>
            </div>

            <Progress
                value={(currentIndex / totalQuestions) * 100}
                className="h-1 rounded-none"
            />

            {/* Content Area */}
            <div className="flex-1 container max-w-5xl mx-auto p-6 flex flex-col items-center">
                <Card className="w-full flex-1 p-8 shadow-md">
                    <h2 className="text-2xl font-semibold mb-6">
                        {currentQuestion.title}
                    </h2>

                    <div className="mb-8">
                        <QuestionPrompt
                            question={{
                                ...currentQuestion,
                                type:
                                    currentQuestion.questionType?.code ||
                                    currentQuestion.questionType?.name,
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

                    <div className="mt-4 border-t pt-20">
                        {isSpeaking ? (
                            <SpeakingRecorder
                                type={qName}
                                timers={{
                                    prepMs: (currentQuestion.speaking?.prepTime || 10) * 1000,
                                    recordMs: (currentQuestion.timeLimit || 40) * 1000,
                                }}
                                auto={{ active: true }} // Always auto in mock
                                onRecorded={(data: any) => {
                                    setAnswerData(data);
                                    // Optional: Auto-next after recording finishes?
                                    // standard behavior: User approves recording or clicks next.
                                }}
                            />
                        ) : isReading || isReadingWriting ? (
                            <ReadingInput
                                questionType={currentQuestion.questionType.name} // Pass name to match switch
                                question={{
                                    id: currentQuestion.id,
                                    promptText:
                                        currentQuestion.content ||
                                        currentQuestion.reading?.passageText,
                                    options: currentQuestion.reading?.options
                                        ? JSON.parse(currentQuestion.reading.options as string)
                                        : [],
                                    textWithBlanks: currentQuestion.reading?.passageText, // Special handling needed for drag drop parsing
                                }}
                                value={answerData}
                                onChange={setAnswerData}
                            />
                        ) : (
                            <textarea
                                className="w-full h-64 p-4 border rounded-md font-mono text-lg resize-y focus:ring-2 ring-primary/20 outline-none"
                                placeholder="Type your response here..."
                                value={
                                    answerData?.text ||
                                    (typeof answerData === "string" ? answerData : "")
                                }
                                onChange={(e) => setAnswerData({ text: e.target.value })}
                                spellCheck={false}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    toast({
                                        title: "Paste Disabled",
                                        description: "PTE does not allow pasting.",
                                        variant: "destructive",
                                    });
                                }}
                            />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Add a default export
