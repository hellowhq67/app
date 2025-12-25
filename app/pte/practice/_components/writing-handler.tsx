'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Type, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WritingHandlerProps {
    question: any
    onComplete: (data: { text: string; wordCount: number }) => void
    isSubmitting: boolean
    status: 'idle' | 'prep' | 'answering' | 'completed'
    timer: number
}

export function WritingHandler({
    question,
    onComplete,
    isSubmitting,
    status,
    timer
}: WritingHandlerProps) {
    const [text, setText] = useState('')
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
    const minWords = question.writingQuestions?.wordCountMin || 5
    const maxWords = question.writingQuestions?.wordCountMax || 75
    const isInvalid = wordCount < minWords || wordCount > maxWords

    // Auto-submit if timer runs out in 'answering' status
    useEffect(() => {
        if (status === 'answering' && timer === 0 && text.trim()) {
            onComplete({ text, wordCount })
        }
    }, [timer, status])

    return (
        <div className="w-full space-y-10">
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-xl md:text-2xl font-medium leading-[1.6] text-gray-800 dark:text-gray-100 italic">
                    "{question.content}"
                </p>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={status !== 'answering' && status !== 'prep'} // Usually writing allows immediate typing
                    placeholder="Start typing your response here..."
                    className={cn(
                        "relative w-full h-[350px] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[32px] p-8 text-gray-800 dark:text-gray-100 text-lg focus:outline-none focus:border-blue-500/50 transition-all resize-none font-sans leading-relaxed shadow-sm",
                        status !== 'answering' && status !== 'prep' && "opacity-50 cursor-not-allowed"
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-5 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl">
                    <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center transition-colors",
                        isInvalid ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                        <Type className="size-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Word Count</p>
                        <p className={cn("text-xl font-black font-mono", isInvalid ? "text-red-500" : "text-emerald-500")}>{wordCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl md:col-span-1">
                    <div className="size-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <AlertCircle className="size-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Requirement</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{minWords} - {maxWords} words</p>
                    </div>
                </div>

                <div className="flex items-center justify-end md:col-span-1">
                    <Button
                        onClick={() => onComplete({ text, wordCount })}
                        disabled={!text.trim() || isInvalid || isSubmitting || (status !== 'answering' && status !== 'prep')}
                        className="w-full h-full min-h-[64px] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="size-6 animate-spin" />
                        ) : (
                            <>
                                Submit Response <CheckCircle className="size-5 group-hover:scale-110 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
