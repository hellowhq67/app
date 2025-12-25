'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Loader2, RotateCcw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SpeakingHandlerProps {
    question: any
    onComplete: (data: { audioBlob: Blob; duration: number; userTranscript?: string }) => void
    isSubmitting: boolean
    status: 'idle' | 'prep' | 'answering' | 'completed'
    timer: number
}

export function SpeakingHandler({
    question,
    onComplete,
    isSubmitting,
    status,
    timer
}: SpeakingHandlerProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Start recording automatically when status changes to 'answering'
    useEffect(() => {
        if (status === 'answering' && !isRecording) {
            startRecording()
        } else if (status === 'completed' || status === 'idle') {
            stopRecording()
        }

        return () => stopRecording()
    }, [status])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                onComplete({ audioBlob: blob, duration: recordingTime })
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (err) {
            toast.error('Microphone access denied. Please check your browser permissions.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
            setIsRecording(false)
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
        }
    }

    return (
        <div className="w-full flex flex-col items-center">
            {/* Question Content Display */}
            <div className="w-full mb-12">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-2xl md:text-3xl font-medium leading-[1.6] text-gray-800 dark:text-gray-100 text-center">
                        {question.content}
                    </p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="size-48 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border-4 border-dashed border-blue-500/20 flex items-center justify-center">
                            <div className="size-32 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30">
                                <Mic className="size-12 text-white" />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Ready to begin</p>
                    </motion.div>
                )}

                {status === 'prep' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md flex flex-col items-center gap-8"
                    >
                        <div className="relative size-44">
                            {/* Progress Circle */}
                            <svg className="size-full -rotate-90">
                                <circle cx="88" cy="88" r="80" className="stroke-gray-100 dark:stroke-white/5 fill-none" strokeWidth="8" />
                                <motion.circle
                                    cx="88" cy="88" r="80"
                                    className="stroke-blue-600 dark:stroke-blue-500 fill-none"
                                    strokeWidth="8"
                                    strokeDasharray={500}
                                    initial={{ strokeDashoffset: 500 }}
                                    animate={{ strokeDashoffset: 500 - (500 * timer) / 35 }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-gray-900 dark:text-white">{timer}s</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Prep Time</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-sm animate-pulse">Preparation in Progress</p>
                            <p className="text-xs text-gray-400 font-medium">Read the text silently and prepare your response</p>
                        </div>
                    </motion.div>
                )}

                {status === 'answering' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md space-y-10"
                    >
                        <div className="flex flex-col items-center gap-8">
                            <div className="size-44 rounded-full bg-red-500/10 dark:bg-red-500/20 border-4 border-red-500/30 flex items-center justify-center animate-pulse relative">
                                <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-20" />
                                <button
                                    onClick={stopRecording}
                                    className="size-32 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl shadow-red-600/40 transition-all active:scale-95 group"
                                >
                                    <Square className="size-12 text-white fill-current group-hover:scale-90 transition-transform" />
                                </button>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">Recording</span>
                                    </div>
                                    <span className="text-sm font-mono font-bold text-gray-500 dark:text-gray-400">{recordingTime}s / 40s</span>
                                </div>
                                <Progress value={(recordingTime / 40) * 100} className="h-3 bg-red-500/10" />
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Volume2 className="size-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">Speak clearly into the microphone. Your voice is being captured...</p>
                        </div>
                    </motion.div>
                )}

                {status === 'completed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6 py-10"
                    >
                        <div className="size-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Loader2 className="size-10 text-emerald-500 animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Analysis in progress</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Our AI is evaluating your pronunciation and fluency...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
