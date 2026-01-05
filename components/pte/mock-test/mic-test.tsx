"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MicTest() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [testResult, setTestResult] = useState<"none" | "success" | "fail">(
        "none"
    );
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const startTest = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContext =
                window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            setIsRecording(true);
            setTestResult("none");

            const updateLevel = () => {
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                setAudioLevel(average);

                if (average > 10) {
                    animationFrameRef.current = requestAnimationFrame(updateLevel);
                } else {
                    animationFrameRef.current = requestAnimationFrame(updateLevel);
                }
            };

            updateLevel();

            // Stop after 5 seconds and check if any sound was detected
            setTimeout(() => {
                stopTest(true);
            }, 5000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setTestResult("fail");
        }
    };

    const stopTest = (checkResult = false) => {
        if (animationFrameRef.current)
            cancelAnimationFrame(animationFrameRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        setIsRecording(false);
        if (checkResult) {
            // If level was detected during the test (simple logic)
            setTestResult(audioLevel > 5 ? "success" : "fail");
        }
        setAudioLevel(0);
    };

    useEffect(() => {
        return () => {
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div
                    className={cn(
                        "p-3 rounded-full transition-colors",
                        isRecording
                            ? "bg-red-50 text-red-600 animate-pulse"
                            : "bg-blue-50 text-blue-600"
                    )}
                >
                    {isRecording ? (
                        <Mic className="h-6 w-6" />
                    ) : (
                        <MicOff className="h-6 w-6" />
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Microphone Check</h3>
                    <p className="text-sm text-gray-500">
                        Ensure your voice is captured clearly
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="h-12 w-full bg-gray-50 rounded-lg flex items-center px-4 gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1 rounded-full transition-all duration-75",
                                isRecording ? "bg-blue-400" : "bg-gray-200"
                            )}
                            style={{
                                height: isRecording
                                    ? `${Math.max(15, audioLevel * Math.random() * 2)} %`
                                    : "20%",
                                opacity: isRecording ? 1 : 0.5,
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    {testResult === "success" && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            Mic working perfectly
                        </div>
                    )}
                    {testResult === "fail" && (
                        <div className="flex items-center gap-2 text-red-600 text-sm font-bold">
                            <AlertCircle className="h-4 w-4" />
                            No sound detected
                        </div>
                    )}
                    {testResult === "none" && !isRecording && (
                        <div className="text-gray-400 text-sm font-medium italic">
                            Click test to begin...
                        </div>
                    )}
                    {isRecording && (
                        <div className="text-blue-600 text-sm font-bold animate-pulse">
                            Speaking now...
                        </div>
                    )}

                    <Button
                        onClick={isRecording ? () => stopTest(true) : startTest}
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        className="rounded-full px-6"
                    >
                        {isRecording ? "Stop Test" : "Test Mic"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
