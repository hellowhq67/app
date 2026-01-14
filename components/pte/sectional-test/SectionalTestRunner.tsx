"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useBeep } from "@/hooks/useBeep";
import { Mic, Pencil, BookOpen, Headphones } from "lucide-react";
import ModernSectionalTestUI from "./ModernSectionalTestUI";

const SECTIONS_META: any = {
    speaking: {
        name: 'Speaking', icon: Mic, color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        bgGlow: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
        totalTime: 30,
    },
    writing: {
        name: 'Writing', icon: Pencil, color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        bgGlow: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
        totalTime: 40,
    },
    reading: {
        name: 'Reading', icon: BookOpen, color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        bgGlow: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
        totalTime: 30,
    },
    listening: {
        name: 'Listening', icon: Headphones, color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        bgGlow: 'radial-gradient(ellipse at top, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
        totalTime: 45,
    },
};

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

    // Real Audio Recording Hook
    const {
        isRecording: recorderIsRecording,
        recordingTime,
        audioBlob: recorderAudioBlob,
        audioUrl: recordedAudioUrl,
        startRecording: startMicRecording,
        stopRecording: stopMicRecording,
        resetRecording,
        error: recorderError,
    } = useAudioRecorder(60); // Max 60 seconds

    const { playBeep } = useBeep();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Modern UI State
    const [isPlaying, setIsPlaying] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [audioProgress, setAudioProgress] = useState(0);
    const [waveHeights, setWaveHeights] = useState(Array(25).fill(20));

    // Answer State
    const [answer, setAnswer] = useState<any>("");
    // Note: audioBlob comes from useAudioRecorder hook now

    // Timer State
    const [timerSeconds, setTimerSeconds] = useState(30 * 60);

    // Determine section type from title or question
    const sectionType = sectionTitle.toLowerCase().includes('speaking') ? 'speaking' :
        sectionTitle.toLowerCase().includes('writing') ? 'writing' :
            sectionTitle.toLowerCase().includes('reading') ? 'reading' : 'listening';

    // Handle recording toggle
    const handleRecordingToggle = useCallback(async () => {
        if (recorderIsRecording) {
            stopMicRecording();
        } else {
            playBeep();
            await startMicRecording();
        }
    }, [recorderIsRecording, startMicRecording, stopMicRecording, playBeep]);

    // Show recording error toast
    useEffect(() => {
        if (recorderError) {
            toast({ title: "Microphone Error", description: recorderError, variant: "destructive" });
        }
    }, [recorderError]);

    useEffect(() => {
        // Reset state on new question
        resetRecording();
        setIsPlaying(false);
        setAudioProgress(0);

        // Initialize answer based on question type
        const type = (currentQuestion.questionType?.name || "").toLowerCase();
        if (type.includes('reorder')) {
            setAnswer(currentQuestion.reading?.options?.paragraphs?.map((p: string, i: number) => ({ id: `p${i}`, text: p })) || []);
        } else if (type.includes('multiple')) {
            setAnswer(type.includes('multiple') ? [] : null);
        } else if (type.includes('fill_blanks')) {
            setAnswer({});
        } else {
            setAnswer("");
        }
    }, [currentQuestion, resetRecording]);

    useEffect(() => {
        if (isPaused || timerSeconds <= 0) return;
        const interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
        return () => clearInterval(interval);
    }, [isPaused, timerSeconds]);

    useEffect(() => {
        if (!recorderIsRecording) return;
        const interval = setInterval(() => setWaveHeights(Array(25).fill(0).map(() => 20 + Math.random() * 80)), 100);
        return () => clearInterval(interval);
    }, [recorderIsRecording]);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => setAudioProgress(p => p >= 100 ? 0 : p + 0.5), 50);
        return () => clearInterval(interval);
    }, [isPlaying]);

    useEffect(() => {
        if (typeof answer === 'string') {
            setWordCount(answer.trim().split(/\s+/).filter(w => w).length);
        } else {
            setWordCount(0);
        }
    }, [answer]);

    const handleNext = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        let answerPayload: any = {};

        const type = (currentQuestion.questionType.name || "").toLowerCase();
        const isSpeaking = type.includes("speaking") || type.includes("read aloud") || type.includes("repeat") || type.includes("describe") || type.includes("retell");

        // Prepare Payload
        if (isSpeaking && recorderAudioBlob) {
            try {
                setLoadingAudio(true);
                const formData = new FormData();
                formData.append("file", recorderAudioBlob, "recording.webm");

                const upRes = await fetch("/api/upload/audio", {
                    method: "POST",
                    body: formData,
                });
                if (upRes.ok) {
                    const { url } = await upRes.json();
                    answerPayload = { audioUrl: url };
                } else {
                    answerPayload = { error: "Audio Upload Failed" };
                }
            } catch (e) {
                console.error("Audio upload error", e);
            } finally {
                setLoadingAudio(false);
            }
        } else {
            // Format answer for different types
            if (type.includes('reorder')) {
                answerPayload = { orderedParagraphs: (answer || []).map((a: any) => a.text) };
            } else if (type.includes('multiple')) {
                if (Array.isArray(answer)) {
                    answerPayload = { selectedOptions: answer };
                } else {
                    answerPayload = { selectedOption: answer };
                }
            } else if (type.includes('fill_blanks')) {
                answerPayload = { filledBlanks: answer };
            } else {
                answerPayload = { text: answer };
            }
        }

        try {
            const res = await fetch("/api/sectional-test/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testId,
                    questionId: currentQuestion.id,
                    answer: answerPayload,
                    timeSpentMs: 0, // Could track this more accurately if needed
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
        } finally {
            setIsSubmitting(false);
        }
    };

    // Map DB question to UI question format
    const uiQuestion = {
        type: currentQuestion.questionType.name,
        content: currentQuestion.content || currentQuestion.reading?.passageText || currentQuestion.writing?.promptText || currentQuestion.listening?.questionText,
        instructions: currentQuestion.questionType.description,
        imageUrl: currentQuestion.imageUrl || currentQuestion.speaking?.imageUrl,
        options: currentQuestion.reading?.options?.choices?.map((c: string, i: number) => ({ id: `opt${i}`, text: c })),
        blanks: currentQuestion.reading?.options?.blanks,
    };

    return (
        <ModernSectionalTestUI
            sectionData={SECTIONS_META[sectionType]}
            currentQuestion={uiQuestion}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            timerSeconds={timerSeconds}
            onNext={handleNext}
            onPrev={() => { }} // Not typically supported in exam mode
            onNav={() => { }} // Read-only in exam mode
            isSubmitting={isSubmitting}
            isRecording={recorderIsRecording}
            setIsRecording={handleRecordingToggle}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            textAnswer={answer}
            setTextAnswer={setAnswer}
            audioProgress={audioProgress}
            waveHeights={waveHeights}
            wordCount={wordCount}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            mobileMenu={mobileMenu}
            setMobileMenu={setMobileMenu}
        />
    );
}
