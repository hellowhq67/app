/* eslint-disable react-hooks/set-state-in-effect */


"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play } from "lucide-react";
import { cn } from "@/lib/utils";

import { SpeakingTimings } from "@/lib/types";

interface SpeakingRecorderProps {
    type: string;
    timers: { prepMs: number; recordMs: number };
    onRecorded: (data: { blob: Blob; durationMs: number; timings: SpeakingTimings }) => void;
    auto?: { active: boolean };
    onStateChange?: (state: string) => void;
}

type RecorderStatus = 'idle' | 'prep' | 'recording' | 'finished';

export default function SpeakingRecorder({ type, timers, onRecorded, auto, onStateChange }: SpeakingRecorderProps) {
    const [status, setStatus] = useState<RecorderStatus>('idle');
    const [timeLeft, setTimeLeft] = useState(0); // in ms
    const [totalDuration, setTotalDuration] = useState(1); // avoid /0
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Beep Sound
    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = 880; // High beep
            gain.gain.value = 0.1;
            osc.start();
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 200); // 200ms beep
        } catch (e) {
            console.error("Audio Context error", e);
        }
    };

    // Move functions up to avoid hoisting issues and use useCallback if needed, 
    // or just declare them as functions.
    function stopAll() {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }

    const startPrep = () => {
        setStatus('prep');
        onStateChange?.('prep');
        setTimeLeft(timers.prepMs);
        setTotalDuration(timers.prepMs);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 100) {
                    clearInterval(timerRef.current as NodeJS.Timeout);
                    startRecording();
                    return 0;
                }
                return prev - 100;
            });
        }, 100);
    };

    const startRecording = async () => {
        playBeep();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            chunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                onRecorded({
                    blob,
                    durationMs: timers.recordMs - timeLeft,
                    timings: {
                        recordMs: timers.recordMs - timeLeft,
                        startAt: new Date().toISOString() // Basic placeholder
                    }
                });
                stream.getTracks().forEach(t => t.stop());
            };

            mr.start();
            setStatus('recording');
            onStateChange?.('recording');
            setTimeLeft(timers.recordMs);
            setTotalDuration(timers.recordMs);

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 100) {
                        finishRecording();
                        return 0;
                    }
                    return prev - 100;
                });
            }, 100);

        } catch (e) {
            console.error("Mic Error", e);
            alert("Could not access microphone. Please ensure permission is granted.");
        }
    };

    const finishRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setStatus('finished');
        onStateChange?.('finished');
    };

    // Initialize Auto Flow
    useEffect(() => {
        if (auto?.active) {
            startPrep();
        }
        return () => stopAll();
    }, [auto?.active, timers.prepMs, timers.recordMs]); // Added dependencies to satisfy lint

    // Helper to format ms
    const formatTime = (ms: number) => {
        const s = Math.ceil(ms / 1000);
        return s;
    };

    // Progress
    const progressVal = ((totalDuration - timeLeft) / totalDuration) * 100;

    return (
        <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto p-6 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center justify-between w-full">
                <span className={cn("text-xs font-bold uppercase tracking-widest",
                    status === 'prep' ? "text-blue-500" :
                        status === 'recording' ? "text-red-500" : "text-muted-foreground"
                )}>
                    {status === 'idle' ? 'Ready' :
                        status === 'prep' ? 'Preparation' :
                            status === 'recording' ? 'Recording' : 'Completed'}
                </span>
                <span className="font-mono text-xl font-bold">
                    {formatTime(timeLeft)}s
                </span>
            </div>

            <Progress value={status === 'prep' || status === 'recording' ? progressVal : 0}
                className={cn("h-3 w-full transition-all",
                    status === 'recording' && "bg-red-100 [&>div]:bg-red-500"
                )}
            />

            <div className="flex items-center gap-4 mt-2">
                {status === 'recording' && (
                    <div className="animate-pulse flex items-center gap-2 text-red-500 text-sm font-medium">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Recording...
                    </div>
                )}
                {status === 'finished' && (
                    <span className="text-green-600 font-medium flex items-center gap-2">
                        Recorded
                    </span>
                )}
            </div>

            {status === 'finished' && audioUrl && (
                <div className="w-full mt-4">
                    <audio src={audioUrl} controls className="w-full h-10" />
                </div>
            )}

            {/* Manual Controls for Testing/Fallback (usually hidden in strict exam) */}
            {/* <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={startPrep} disabled={status !== 'idle'}>Test Prep</Button>
            </div> */}
        </div>
    );
}
