'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Headphones, Play, Volume2, Music, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WritingHandler } from './writing-handler'
import { ReadingHandler } from './reading-handler'
import { cn } from '@/lib/utils'

interface ListeningHandlerProps {
    question: any
    onComplete: (data: any) => void
    isSubmitting: boolean
    status: 'idle' | 'prep' | 'answering' | 'completed'
    timer: number
}

export function ListeningHandler({
    question,
    onComplete,
    isSubmitting,
    status,
    timer
}: ListeningHandlerProps) {
    const [audioStatus, setAudioStatus] = useState<'idle' | 'playing' | 'ended'>('idle')
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false)

    // Use writing sub-handler if it's a writing-based task
    const isWritingTask = question.questionType?.code?.toLowerCase().includes('write') ||
        question.questionType?.code?.toLowerCase().includes('summarize_spoken') ||
        false

    useEffect(() => {
        if (question.audioUrl || question.listeningDetails?.audioFileUrl) {
            const url = question.audioUrl || question.listeningDetails?.audioFileUrl
            audioRef.current = new Audio(url)
            const audio = audioRef.current

            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
            audio.addEventListener('timeupdate', () => {
                setCurrentTime(audio.currentTime)
                setProgress((audio.currentTime / audio.duration) * 100)
            })
            audio.addEventListener('ended', () => {
                setAudioStatus('ended')
                setHasPlayedOnce(true)
            })

            return () => {
                audio.pause()
                audio.removeEventListener('loadedmetadata', () => { })
                audio.removeEventListener('timeupdate', () => { })
                audio.removeEventListener('ended', () => { })
            }
        }
    }, [question])

    // Handle playing based on wrapper status
    useEffect(() => {
        if (status === 'answering' && audioStatus === 'idle' && !hasPlayedOnce) {
            playAudio()
        }
    }, [status, audioStatus, hasPlayedOnce])

    const playAudio = () => {
        if (audioRef.current && !hasPlayedOnce) {
            audioRef.current.play()
            setAudioStatus('playing')
        }
    }

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="w-full space-y-10 animate-in fade-in duration-700">
            {/* Premium Audio Player Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[40px] p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className={cn(
                        "size-24 rounded-[32px] flex items-center justify-center transition-all duration-700",
                        audioStatus === 'playing'
                            ? "bg-blue-600 shadow-2xl shadow-blue-600/40 scale-110"
                            : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                    )}>
                        {audioStatus === 'playing' ? (
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4].map(b => (
                                    <motion.div
                                        key={b}
                                        animate={{ height: [8, 20, 8] }}
                                        transition={{ duration: 0.8, repeat: Infinity, delay: b * 0.1 }}
                                        className="w-1.5 bg-white rounded-full"
                                    />
                                ))}
                            </div>
                        ) : (
                            <Headphones className="size-10 text-blue-500" />
                        )}
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    {audioStatus === 'playing' ? 'Audio Stream Active' : audioStatus === 'ended' ? 'Playback Finished' : 'Audio Player Ready'}
                                    {audioStatus === 'playing' && <span className="size-2 rounded-full bg-red-500 animate-ping" />}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Single Playback Only • 1x Speed</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-mono font-black text-blue-600 dark:text-blue-500">{formatTime(currentTime)}</span>
                                <span className="text-gray-300 dark:text-gray-700 mx-3 text-2xl font-light">/</span>
                                <span className="text-gray-400 font-mono font-bold">{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="relative pt-1">
                            <Progress value={progress} className="h-4 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-100 dark:border-white/5" />
                            {audioStatus === 'playing' && (
                                <div className="absolute top-0 bottom-0 left-0 bg-blue-500/10 blur-xl w-full -z-10 animate-pulse" />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={playAudio}
                            disabled={hasPlayedOnce || audioStatus === 'playing' || status !== 'answering'}
                            className={cn(
                                "size-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl",
                                hasPlayedOnce || status !== 'answering'
                                    ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed border border-transparent"
                                    : audioStatus === 'playing'
                                        ? "bg-blue-600/20 text-blue-500 border border-blue-500/30"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-95 border border-blue-500"
                            )}
                        >
                            {audioStatus === 'playing' ? <Volume2 className="size-10 animate-pulse" /> : <Play className="size-10 fill-current ml-1" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Instructional Message based on audio status */}
            <AnimatePresence>
                {audioStatus === 'idle' && status === 'answering' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 p-5 rounded-3xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 shadow-sm"
                    >
                        <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <Info className="size-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Audio will start in a few seconds. Prepare to listen carefully and take notes.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Response Area - Delegation */}
            <div className={cn(
                "transition-all duration-1000",
                audioStatus === 'idle' && !hasPlayedOnce ? "opacity-30 blur-sm pointer-events-none" : "opacity-100 blur-0"
            )}>
                {isWritingTask ? (
                    <WritingHandler
                        question={question}
                        onComplete={onComplete}
                        isSubmitting={isSubmitting}
                        status={status}
                        timer={timer}
                    />
                ) : (
                    <ReadingHandler
                        question={question}
                        onComplete={onComplete}
                        isSubmitting={isSubmitting}
                        status={status}
                        timer={timer}
                    />
                )}
            </div>
        </div>
    )
}
