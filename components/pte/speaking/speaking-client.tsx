"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    PlayCircle,
    RotateCcw,
    CheckCircle2,
    Volume2,
    Loader2,
} from "lucide-react";
import { useBeep } from "@/hooks/useBeep";
import { toast } from "@/hooks/use-toast";
import { QuestionType, SpeakingFeedbackData, SpeakingQuestion } from "@/lib/types";
import { scoreReadAloudAttempt, scoreSpeakingAttempt } from "@/app/actions/pte";
import { ScoreDisplay } from "@/components/pte/speaking/score-display";
import { SpeechInput } from "@/components/ai-elements/speech-input";

interface SpeakingPracticeClientProps {
    question: SpeakingQuestion;
    autoStart?: boolean;
}

export function SpeakingPracticeClient({
    question,
    autoStart = false,
}: SpeakingPracticeClientProps) {
    const questionId = question.id;
    const questionType = question.questionType?.code || question.questionTypeId;
    const content = question.content || "";
    const audioUrl = question.audioUrl || question.speaking?.audioPromptUrl || undefined;
    const imageUrl = question.imageUrl || undefined;
    const timeLimit = question.questionType?.timeLimit || 40;

    // Determine specific timings based on question type
    const getTimings = () => {
        switch (questionType) {
            case "read_aloud":
                return { prep: 35, record: 40 };
            case "repeat_sentence":
                return { prep: 3, record: 15 };
            case "describe_image":
                return { prep: 25, record: 40 };
            case "retell_lecture":
                return { prep: 10, record: 40 };
            case "answer_short_question":
                return { prep: 3, record: 10 };
            case "respond_to_situation":
                return { prep: 20, record: 40 };
            default:
                return { prep: 10, record: 40 };
        }
    };

    const timings = getTimings();
    const recordDuration = timeLimit || timings.record;

    const [status, setStatus] = useState<
        "idle" | "playing_audio" | "preparing" | "recording" | "completed"
    >("idle");
    const [prepTime, setPrepTime] = useState(timings.prep);
    const [feedback, setFeedback] = useState<SpeakingFeedbackData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [transcript, setTranscript] = useState("");
    const [isRecordingActive, setIsRecordingActive] = useState(false);

    const prepTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { playBeep } = useBeep();
    const speechInputRef = useRef<HTMLDivElement>(null);

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
        };
    }, []);

    // Auto-Start Effect
    useEffect(() => {
        if (autoStart && status === 'idle') {
            const timer = setTimeout(() => {
                startSession();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoStart]);

    const startSession = () => {
        // Reset state
        setPrepTime(timings.prep);
        setFeedback(null);
        setRecordedBlob(null);
        setRecordedUrl(null);
        setTranscript("");
        setIsRecordingActive(false);

        // Flow depends on question type
        if (
            audioUrl &&
            (questionType === "repeat_sentence" ||
                questionType === "retell_lecture" ||
                questionType === "answer_short_question")
        ) {
            setStatus("playing_audio");
            if (audioRef.current) {
                audioRef.current.play().catch((e) => {
                    console.error("Audio play failed", e);
                    toast({
                        title: "Auto-play blocked",
                        description: "Please click Start.",
                        variant: "destructive"
                    });
                    setStatus("idle");
                });
            }
        } else {
            startPrep();
        }
    };

    const startPrep = () => {
        setStatus("preparing");
        if (prepTimerRef.current) clearInterval(prepTimerRef.current);

        prepTimerRef.current = setInterval(() => {
            setPrepTime((prev) => {
                if (prev <= 1) {
                    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                    beginRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const beginRecording = () => {
        playBeep();
        setTimeout(() => {
            setStatus("recording");
            setIsRecordingActive(true);
            // Trigger click on SpeechInput to start recording
            speechInputRef.current?.querySelector('button')?.click();
        }, 300);
    };

    const handleAudioEnded = () => {
        startPrep();
    };

    const handleRetry = () => {
        setFeedback(null);
        setRecordedBlob(null);
        setRecordedUrl(null);
        setTranscript("");
        setStatus("idle");
        setPrepTime(timings.prep);
        setIsRecordingActive(false);
    };

    const handleTranscriptionChange = (text: string) => {
        setTranscript(text);
    };

    const handleAudioRecorded = async (audioBlob: Blob): Promise<string> => {
        // Store the recorded blob
        setRecordedBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedUrl(url);
        setStatus("completed");
        setIsRecordingActive(false);

        // Fallback transcription for browsers without Web Speech API
        // This example uses a generic placeholder - replace with your actual transcription service
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "audio.webm");

            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Transcription failed");
            }

            const data = await response.json();
            return data.text || "";
        } catch (error) {
            console.error("Transcription error:", error);
            // Return empty string if transcription fails
            return "";
        }
    };

    const handleSubmit = async () => {
        if (!recordedBlob) return;
        setIsSubmitting(true);
        try {
            const file = new File([recordedBlob], "recording.webm", {
                type: "audio/webm",
            });
            let result;
            let typeKey: QuestionType;

            switch (questionType) {
                case "read_aloud": typeKey = QuestionType.READ_ALOUD; break;
                case "repeat_sentence": typeKey = QuestionType.REPEAT_SENTENCE; break;
                case "describe_image": typeKey = QuestionType.DESCRIBE_IMAGE; break;
                case "retell_lecture": typeKey = QuestionType.RE_TELL_LECTURE; break;
                case "answer_short_question": typeKey = QuestionType.ANSWER_SHORT_QUESTION; break;
                case "respond_to_situation": typeKey = QuestionType.RESPOND_TO_A_SITUATION; break;
                default:
                    typeKey = QuestionType.READ_ALOUD;
            }

            if (questionType === "read_aloud") {
                result = await scoreReadAloudAttempt(file, content, questionId);
            } else {
                result = await scoreSpeakingAttempt(typeKey, file, content, questionId);
            }

            if (result.success && result.feedback) {
                setFeedback(result.feedback);
                // Use the persistent URL from the server
                if (result.audioUrl) {
                    setRecordedUrl(result.audioUrl);
                }
                toast({ title: "Scoring complete!" });
            } else {
                toast({
                    title: "Scoring failed",
                    description: result.error || "Failed to score attempt",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Submission failed", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderQuestionContent = () => {
        if (imageUrl) {
            return (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 flex justify-center">
                    <div className="relative w-full max-w-md aspect-[4/3]">
                        <Image src={imageUrl} alt="Describe this image" fill className="object-contain" />
                    </div>
                </div>
            );
        }

        if (status === "playing_audio") {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                    <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-full animate-pulse mb-4">
                        <Volume2 className="size-8 text-blue-600 dark:text-blue-300" />
                    </div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Listening...</p>
                </div>
            );
        }

        const showText = questionType === "read_aloud" || questionType === "respond_to_situation" || !audioUrl;
        if (showText && content) {
            return (
                <div className="bg-white dark:bg-[#1e1e20] p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm mb-6">
                    <p className="text-xl leading-relaxed font-medium text-gray-800 dark:text-gray-200">{content}</p>
                </div>
            );
        }
        return null;
    };



    return (
        <div className="space-y-8">
            {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />}

            {renderQuestionContent()}

            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-6 flex flex-col items-center gap-4 transition-all min-h-[250px] justify-center">
                {status === "idle" && (
                    <div className="text-center py-4">
                        <Button
                            size="lg"
                            onClick={startSession}
                            className="rounded-full px-8 h-14 gap-2 bg-primary text-lg shadow-xl hover:scale-105 transition-all"
                        >
                            <PlayCircle className="size-6" /> Start Practice
                        </Button>
                    </div>
                )}

                {status === "preparing" && (
                    <div className="text-center space-y-4 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-widest">Preparing...</span>
                            <span className="text-xs text-muted-foreground">Starting in {prepTime}s</span>
                        </div>
                        <Progress value={(1 - prepTime / timings.prep) * 100} className="h-3 bg-amber-100 dark:bg-amber-900/20" indicatorClassName="bg-amber-500" />
                        <div className="text-6xl font-mono font-bold text-amber-500 tabular-nums">{prepTime}</div>
                        <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/10 py-2 px-4 rounded-full inline-block">Speak after the beep</p>
                    </div>
                )}

                {status === "recording" && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95">
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-red-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Recording
                            </p>
                        </div>

                        <div ref={speechInputRef}>
                            <SpeechInput
                                onTranscriptionChange={handleTranscriptionChange}
                                onAudioRecorded={handleAudioRecorded}
                                size="icon"
                                variant="outline"
                                lang="en-US"
                                maxDuration={recordDuration}
                                autoStop={true}
                            />
                        </div>

                        {transcript && (
                            <div className="max-w-2xl rounded-lg border bg-card p-4 text-sm">
                                <p className="text-muted-foreground mb-2">
                                    <strong>Live Transcript:</strong>
                                </p>
                                <p className="text-sm leading-relaxed">{transcript}</p>
                            </div>
                        )}
                    </div>
                )}

                {status === "completed" && !feedback && (
                    <div className="text-center space-y-6 w-full max-w-2xl">
                        <div className="text-xl font-medium text-green-600 dark:text-green-400 flex items-center gap-2 justify-center">
                            <CheckCircle2 className="size-6" /> Recording Complete
                        </div>

                        {recordedUrl && (
                            <div className="space-y-4 w-full bg-white dark:bg-black/20 p-6 rounded-lg border border-gray-200 dark:border-white/10 text-left">
                                {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
                                <audio
                                    src={recordedUrl}
                                    controls
                                    className="w-full mb-4"
                                />

                                {transcript && (
                                    <div className="bg-muted p-4 rounded-md text-sm">
                                        <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">Transcript</h4>
                                        <p className="leading-relaxed">{transcript}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" size="lg" onClick={handleRetry} className="rounded-full h-12 px-8">
                                <RotateCcw className="size-4 mr-2" /> Retry
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="rounded-full h-12 px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                            >
                                {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                {isSubmitting ? "Scoring..." : "Submit Answer"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {feedback && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <ScoreDisplay
                        score={{
                            overallScore: feedback.overallScore,
                            content: feedback.content?.score || 0,
                            pronunciation: feedback.pronunciation?.score || 0,
                            fluency: feedback.fluency?.score || 0,
                            feedback: [],
                            detailedAnalysis: {
                                strengths: feedback.strengths || [],
                                improvements: feedback.areasForImprovement || [],
                                tips: feedback.suggestions || [],
                            },
                        }}
                        wordMarking={feedback.wordMarking}
                        spokenText={feedback.transcript || transcript}
                        originalText={content}
                        audioUrl={recordedUrl || undefined}
                        onClose={() => setFeedback(null)}
                    />
                    <div className="flex justify-center mt-8">
                        <Button variant="outline" onClick={handleRetry} className="gap-2">
                            <RotateCcw className="size-4" /> Try Another Attempt
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
