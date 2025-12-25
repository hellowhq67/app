'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Pause, Volume2, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WritingPractice } from './writing-practice';
import { ReadingPractice } from './reading-practice';

interface ListeningPracticeProps {
    question: any;
    onComplete: (data: any) => void;
}

export function ListeningPractice({ question, onComplete }: ListeningPracticeProps) {
    const [audioStatus, setAudioStatus] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

    // Check if it's a writing-based listening task (e.g., Write From Dictation)
    const isWritingTask = question.questionType?.code?.includes('write') || false;

    useEffect(() => {
        if (question.audioUrl || question.listeningDetails?.audioFileUrl) {
            const url = question.audioUrl || question.listeningDetails?.audioFileUrl;
            audioRef.current = new Audio(url);

            const audio = audioRef.current;

            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
            audio.addEventListener('timeupdate', () => {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            });
            audio.addEventListener('ended', () => {
                setAudioStatus('ended');
                setHasPlayedOnce(true);
            });

            // Auto-play after 3 seconds (PTE style)
            const timeout = setTimeout(() => {
                if (audioStatus === 'idle' && !hasPlayedOnce) {
                    playAudio();
                }
            }, 3000);

            return () => {
                clearTimeout(timeout);
                audio.pause();
                audio.removeEventListener('loadedmetadata', () => { });
                audio.removeEventListener('timeupdate', () => { });
                audio.removeEventListener('ended', () => { });
            };
        }
    }, [question]);

    const playAudio = () => {
        if (audioRef.current && !hasPlayedOnce) {
            audioRef.current.play();
            setAudioStatus('playing');
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Audio Control Card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className={`size-24 rounded-3xl flex items-center justify-center transition-all duration-500 ${audioStatus === 'playing' ? 'bg-blue-600 shadow-2xl shadow-blue-600/40 scale-105' : 'bg-white/5 border border-white/10'}`}>
                        <Headphones className={`size-10 ${audioStatus === 'playing' ? 'text-white' : 'text-blue-400'}`} />
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Status: {audioStatus === 'idle' ? 'Preparing...' : audioStatus === 'playing' ? 'Playing Audio' : audioStatus === 'ended' ? 'Audio Finished' : 'Paused'}</h3>
                                <p className="text-sm text-gray-500 font-medium">Listening tasks can only be played once.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-mono font-bold text-blue-400">{formatTime(currentTime)}</span>
                                <span className="text-gray-600 mx-2">/</span>
                                <span className="text-gray-500 font-mono">{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="relative group/progress">
                            <Progress value={progress} className="h-2.5 bg-white/5" />
                            <div
                                className="absolute top-0 bottom-0 bg-blue-400/20 blur-sm -z-10 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={playAudio}
                            disabled={hasPlayedOnce || audioStatus === 'playing'}
                            className={`size-16 rounded-2xl flex items-center justify-center transition-all ${hasPlayedOnce
                                    ? 'bg-white/5 text-gray-700 cursor-not-allowed'
                                    : audioStatus === 'playing'
                                        ? 'bg-blue-600/20 text-blue-400 cursor-default'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 active:scale-95'
                                }`}
                        >
                            {audioStatus === 'playing' ? <Volume2 className="size-8 animate-pulse" /> : <Play className="size-8 fill-current" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="pt-4">
                {isWritingTask ? (
                    <WritingPractice question={question} onComplete={onComplete} />
                ) : (
                    <ReadingPractice question={question} onComplete={onComplete} />
                )}
            </div>
        </div>
    );
}
