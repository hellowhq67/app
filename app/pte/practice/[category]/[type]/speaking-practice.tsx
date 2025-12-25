'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface SpeakingPracticeProps {
    question: any;
    onComplete: (data: { audioBlob: Blob; duration: number }) => void;
}

export function SpeakingPractice({ question, onComplete }: SpeakingPracticeProps) {
    const [phase, setPhase] = useState<'idle' | 'preparing' | 'recording' | 'finished'>('idle');
    const [timeLeft, setTimeLeft] = useState(30); // Prep time
    const [recordingTime, setRecordingTime] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startPrep = () => {
        setPhase('preparing');
        setTimeLeft(30);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    startRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                onComplete({ audioBlob: blob, duration: recordingTime });
                setPhase('finished');
            };

            mediaRecorder.start();
            setIsRecording(true);
            setPhase('recording');
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 40) { // Max speaking time
                        stopRecording();
                        return 40;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            toast.error('Microphone access denied');
            setPhase('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            setIsRecording(false);
            clearInterval(timerRef.current!);
        }
    };

    const reset = () => {
        clearInterval(timerRef.current!);
        setPhase('idle');
        setTimeLeft(30);
        setRecordingTime(0);
        setIsRecording(false);
    };

    return (
        <div className="flex flex-col items-center gap-10 py-10">
            {phase === 'idle' && (
                <div className="text-center space-y-6">
                    <div className="size-44 rounded-full bg-blue-600/10 flex items-center justify-center border-4 border-dashed border-blue-500/20">
                        <Button
                            size="lg"
                            onClick={startPrep}
                            className="size-32 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/40 transition-all hover:scale-105"
                        >
                            <Mic className="size-12 text-white" />
                        </Button>
                    </div>
                    <p className="text-gray-400 font-medium">Click the microphone to start preparation</p>
                </div>
            )}

            {phase === 'preparing' && (
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="relative size-40 mx-auto">
                        <svg className="size-40 -rotate-90">
                            <circle cx="80" cy="80" r="70" className="stroke-white/5 fill-none" strokeWidth="8" />
                            <circle
                                cx="80" cy="80" r="70"
                                className="stroke-blue-500 fill-none transition-all duration-1000"
                                strokeWidth="8"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * timeLeft) / 30}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-mono font-bold">{timeLeft}s</span>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-blue-400 uppercase tracking-widest">Preparation Time</p>
                    <Button variant="ghost" onClick={reset} className="text-gray-500 hover:text-white">
                        <RotateCcw className="size-4 mr-2" /> Reset
                    </Button>
                </div>
            )}

            {phase === 'recording' && (
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="size-40 rounded-full bg-red-600/20 flex items-center justify-center border-4 border-red-500/30 animate-pulse">
                            <Button
                                variant="destructive"
                                onClick={stopRecording}
                                className="size-32 rounded-full bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/40 relative active:scale-95 transition-transform"
                            >
                                <Square className="size-12 text-white fill-white" />
                            </Button>
                        </div>
                        <div className="space-y-2 w-full">
                            <Progress value={(recordingTime / 40) * 100} className="h-3 bg-red-950/30" />
                            <p className="text-red-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                                Recording: {recordingTime}s / 40s
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'finished' && (
                <div className="text-center py-10 space-y-4">
                    <div className="size-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <Loader2 className="size-10 text-emerald-400 animate-spin" />
                    </div>
                    <p className="text-emerald-400 font-bold">Recording captured! Preparing summary...</p>
                </div>
            )}
        </div>
    );
}
