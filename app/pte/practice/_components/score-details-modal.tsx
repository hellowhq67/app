'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Sparkles,
    Trophy,
    CheckCircle2,
    TrendingUp,
    MessageSquare,
    ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScoreDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: any
    question: any
}

export function ScoreDetailsModal({ isOpen, onClose, data, question }: ScoreDetailsModalProps) {
    if (!isOpen || !data) return null;

    const metrics = data.metrics || {
        content: data.content?.score || 0,
        pronunciation: data.pronunciation?.score || 0,
        fluency: data.fluency?.score || 0,
        grammar: data.grammar?.score || 0,
        vocabulary: data.vocabulary?.score || 0,
        spelling: data.spelling?.score || 0,
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-[#121214] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-end">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md border border-white/10"
                            >
                                <X className="size-6" />
                            </button>

                            <div className="flex items-center gap-4 mb-2">
                                <div className="size-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Trophy className="size-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">AI Scoring Report</h2>
                                    <p className="text-blue-100/70 text-xs font-bold uppercase tracking-widest">{question.type?.replace(/_/g, ' ')} • Result Analysis</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="p-8 md:p-12 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Overall Score & Metrics */}
                                <div className="space-y-10">
                                    <div className="flex items-center gap-6 p-8 rounded-[32px] bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
                                        <div className="relative size-24">
                                            <svg className="size-full" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200 dark:stroke-white/5" strokeWidth="3" />
                                                <motion.circle
                                                    cx="18" cy="18" r="16" fill="none" className="stroke-blue-600 dark:stroke-blue-500"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    initial={{ strokeDasharray: "0, 100" }}
                                                    animate={{ strokeDasharray: `${(data.overallScore || 0) * 1.1}, 100` }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">{data.overallScore || 0}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Overall</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Performance Summary</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Your performance aligns with a Band 7.5+ equivalent.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <TrendingUp className="size-4" />
                                            Enabling Skills
                                        </h3>
                                        <div className="space-y-4">
                                            {Object.entries(metrics).map(([key, value]: any) => {
                                                if (typeof value === 'object') return null; // Skip non-primitive metrics for now
                                                return (
                                                    <div key={key} className="space-y-1.5">
                                                        <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                                            <span className="text-gray-500">{key}</span>
                                                            <span className="text-gray-900 dark:text-white">{value} / 5</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(value / 5) * 100}%` }}
                                                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: AI Feedback & Suggestions */}
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <MessageSquare className="size-4" />
                                            Expert Feedback
                                        </h3>
                                        <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 italic text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                            "{data.feedback || "Good job! Focus on practicing more items to see consistent improvement."}"
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <Sparkles className="size-4" />
                                            Key Recommendations
                                        </h3>
                                        <div className="space-y-3">
                                            {(data.suggestions || ["Work on word enunciation", "Improve response pacing"]).map((tip: string, idx: number) => (
                                                <div key={idx} className="flex gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                                                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                            >
                                Close Report
                            </button>
                            <button
                                className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-2 group"
                            >
                                Next Task <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
