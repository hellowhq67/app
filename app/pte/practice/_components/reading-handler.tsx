'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReadingHandlerProps {
    question: any
    onComplete: (data: any) => void
    isSubmitting: boolean
    status: 'idle' | 'prep' | 'answering' | 'completed'
    timer: number
}

export function ReadingHandler({
    question,
    onComplete,
    isSubmitting,
    status,
    timer
}: ReadingHandlerProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])

    // Determine if single or multiple choice based on question codes
    const isMultiple = question.questionType?.code?.includes('multiple') || false
    const options = question.readingQuestions?.options?.choices || []

    const toggleOption = (idx: number) => {
        if (status !== 'answering' && status !== 'prep') return

        if (isMultiple) {
            setSelectedIndices(prev =>
                prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
            )
        } else {
            setSelectedIndices([idx])
        }
    }

    const handleFinalize = () => {
        onComplete({ selectedIndices })
    }

    return (
        <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Reading Passage/Context */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[32px] p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-6 text-blue-600 dark:text-blue-400">
                    <BookOpen className="size-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Reading Passage</span>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200">
                        {question.content}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 px-2 mb-4">Select the correct {isMultiple ? 'options' : 'option'}</h3>

                <div className="grid grid-cols-1 gap-4">
                    {options.map((option: string, idx: number) => {
                        const isSelected = selectedIndices.includes(idx)
                        return (
                            <button
                                key={idx}
                                onClick={() => toggleOption(idx)}
                                disabled={status !== 'answering' && status !== 'prep'}
                                className={cn(
                                    "flex items-center gap-6 p-6 rounded-3xl border transition-all text-left relative group",
                                    isSelected
                                        ? "bg-blue-600/5 dark:bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20"
                                        : "bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/30"
                                )}
                            >
                                <div className={cn(
                                    "size-10 rounded-xl flex items-center justify-center border font-bold text-sm transition-all",
                                    isSelected
                                        ? "bg-blue-600 border-blue-400 text-white"
                                        : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 group-hover:text-blue-500"
                                )}>
                                    {String.fromCharCode(65 + idx)}
                                </div>

                                <span className={cn(
                                    "text-lg font-medium transition-colors flex-1",
                                    isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                                )}>
                                    {option}
                                </span>

                                <div className={cn(
                                    "size-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    isSelected
                                        ? "bg-blue-500 border-blue-400 scale-110"
                                        : "border-gray-200 dark:border-white/5 opacity-0 group-hover:opacity-100"
                                )}>
                                    {isSelected && <CheckCircle className="size-4 text-white" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex justify-between items-center bg-blue-500/5 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-6 rounded-3xl">
                <div className="flex items-center gap-3">
                    <AlertCircle className="size-5 text-blue-500" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium italic">Double check your selections before finalizing.</p>
                </div>
                <Button
                    onClick={handleFinalize}
                    disabled={selectedIndices.length === 0 || isSubmitting || (status !== 'answering' && status !== 'prep')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black h-16 px-12 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3 active:scale-95 disabled:opacity-30"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="size-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            Analyzing...
                        </div>
                    ) : (
                        <>
                            Finalize Answer <ArrowRight className="size-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
