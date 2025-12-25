'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertCircle,
    Trophy,
    Star,
    MessageSquare,
    Bookmark,
    StickyNote,
    Search,
    Headphones,
    Mic,
    FileText,
    Keyboard
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { QuestionType, AIFeedbackData, SpeakingFeedbackData } from '@/lib/types'
import { cn } from '@/lib/utils'

// Internal UI Components
import { ScoreDetailsModal } from './score-details-modal.tsx'

interface UniversalPracticeWrapperProps {
    category: string
    type: string
    children: (props: {
        question: any
        isSubmitting: boolean
        onComplete: (data: any) => void
        status: 'idle' | 'prep' | 'answering' | 'completed'
        timer: number
    }) => React.ReactNode
}

export function UniversalPracticeWrapper({
    category,
    type,
    children
}: UniversalPracticeWrapperProps) {
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<'idle' | 'prep' | 'answering' | 'completed'>('idle')
    const [timer, setTimer] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [scoreData, setScoreData] = useState<any>(null)
    const [showScoreModal, setShowScoreModal] = useState(false)

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch Questions
    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await fetch(`/api/pte/questions?type=${encodeURIComponent(type)}`)
                const data = await response.json()
                if (data.success) {
                    setQuestions(data.data)
                }
            } catch (error) {
                toast.error('Failed to load questions')
            } finally {
                setLoading(false)
            }
        }
        fetchQuestions()
    }, [type])

    // Timer Logic
    useEffect(() => {
        if (status === 'prep' || status === 'answering') {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev > 0 ? prev - 1 : 0)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [status])

    // handle auto-transition from prep to answering
    useEffect(() => {
        if (status === 'prep' && timer === 0) {
            setStatus('answering')
            // Set answering timer based on question data or defaults
            setTimer(questions[currentIndex]?.questionData?.timeLimit || 40)
        }
    }, [timer, status, currentIndex, questions])

    const currentQuestion = questions[currentIndex]

    const handleStart = () => {
        const prepTime = currentQuestion?.questionData?.prepMs ? currentQuestion.questionData.prepMs / 1000 : 35
        setTimer(prepTime)
        setStatus('prep')
    }

    const handleComplete = async (submission: any) => {
        setIsSubmitting(true)
        setStatus('completed')

        try {
            const response = await fetch('/api/pte/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    questionId: currentQuestion.id,
                    submission
                })
            })
            const result = await response.json()

            if (result.success) {
                setScoreData(result.data)
                setShowScoreModal(true)
            } else {
                toast.error('Scoring failed: ' + result.error)
            }
        } catch (error) {
            toast.error('Failed to submit for scoring')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setStatus('idle')
            setTimer(0)
            setScoreData(null)
            setShowScoreModal(false)
        } else {
            router.push(`/pte/practice/${category}`)
        }
    }

    if (loading) return <LoadingState />
    if (!currentQuestion) return <EmptyState category={category} />

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0a0a0b] flex flex-col font-sans">
            {/* Premium Header - Following screenshot style */}
            <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/pte/practice" className="font-bold text-xl text-blue-600 dark:text-blue-400">
                        PTE Elite
                    </Link>
                    <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />
                    <nav className="hidden md:flex items-center gap-6">
                        {['Dashboard', 'Practice', 'Mock Tests', 'Analytics'].map(item => (
                            <span key={item} className={cn(
                                "text-sm font-medium cursor-pointer transition-colors",
                                item === 'Practice' ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            )}>
                                {item}
                            </span>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[11px] font-bold text-yellow-600 dark:text-yellow-500 uppercase">Upgrade</span>
                    </div>
                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800">
                        JD
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Dashboard Style */}
                <aside className="w-64 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hidden lg:flex flex-col p-4">
                    <div className="space-y-1 mb-8">
                        <SidebarItem icon={<ChevronLeft className="size-4" />} label="Back to List" href={`/pte/practice/${category}`} />
                    </div>

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Practice Type</div>
                    <div className="space-y-1">
                        <SidebarItem icon={<Mic className="size-4" />} label="Speaking" active={category === 'speaking'} />
                        <SidebarItem icon={<FileText className="size-4" />} label="Writing" active={category === 'writing'} />
                        <SidebarItem icon={<Keyboard className="size-4" />} label="Reading" active={category === 'reading'} />
                        <SidebarItem icon={<Headphones className="size-4" />} label="Listening" active={category === 'listening'} />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-[#F5F7FA] dark:bg-[#0a0a0b] p-6 lg:p-10 flex flex-col items-center">
                    <div className="w-full max-w-4xl space-y-6">
                        {/* Title & Type Switcher breadcrumb */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>PTE</span>
                                <ChevronRight className="size-3" />
                                <span className="capitalize">{category}</span>
                                <ChevronRight className="size-3" />
                                <span className="font-semibold text-gray-900 dark:text-white uppercase tracking-tighter">{type.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="text-xs font-medium text-gray-500 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full">
                                Question {currentIndex + 1} of {questions.length}
                            </div>
                        </div>

                        {/* Centered Main Card */}
                        <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[28px] shadow-sm overflow-hidden min-h-[500px] flex flex-col relative transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Question Header Banner */}
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    PTE {type.replace(/_/g, ' ')} Practice Test
                                    <span className="ml-3 text-xs font-normal text-gray-400">ID: {currentQuestion.id.slice(-5).toUpperCase()}</span>
                                </h2>

                                {status !== 'idle' && (
                                    <div className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl border animate-pulse",
                                        status === 'prep'
                                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 font-bold"
                                            : "bg-red-500/10 border-red-500/20 text-red-600 font-bold"
                                    )}>
                                        <Clock className="size-4" />
                                        <span className="font-mono">{status === 'prep' ? 'Record in' : 'Remaining'}: {timer}s</span>
                                    </div>
                                )}
                            </div>

                            {/* Status Banner - for permissions etc */}
                            {status === 'idle' && (
                                <div className="mx-6 mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center gap-3">
                                    <AlertCircle className="size-5 text-blue-500" />
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Ready to start? Make sure your microphone is working correctly.</p>
                                    <button
                                        onClick={handleStart}
                                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Start Question
                                    </button>
                                </div>
                            )}

                            {/* Card Content Area */}
                            <div className="flex-1 p-8 md:p-12 relative">
                                {children({
                                    question: currentQuestion,
                                    isSubmitting,
                                    onComplete: handleComplete,
                                    status,
                                    timer
                                })}
                            </div>

                            {/* Footer Controls */}
                            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <UtilityButton icon={<Star className="size-4" />} label="Fav" />
                                    <UtilityButton icon={<StickyNote className="size-4" />} label="Note" />
                                    <UtilityButton icon={<Bookmark className="size-4" />} label="Save" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => router.push(`/pte/practice/${category}`)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                                    >
                                        Exit
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
                                    >
                                        Next <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Community/Discussion Area - Below Practice Card */}
                        <div className="mt-12 w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <MessageSquare className="size-5 text-blue-500" />
                                    Community Discussion
                                </h3>
                                <span className="text-xs font-medium text-gray-400">24 Comments</span>
                            </div>

                            <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[28px] p-8 shadow-sm">
                                <div className="text-center py-12">
                                    <div className="size-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300 dark:border-white/10">
                                        <MessageSquare className="size-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Be the first to share your thoughts on this question!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ScoreDetailsModal
                isOpen={showScoreModal}
                onClose={() => setShowScoreModal(false)}
                data={scoreData}
                question={currentQuestion}
            />
        </div>
    )
}

function SidebarItem({ icon, label, active = false, href }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) {
    const content = (
        <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all border",
            active
                ? "bg-blue-50 dark:bg-blue-600/10 border-blue-100 dark:border-blue-600/20 text-blue-600 dark:text-blue-400 font-bold"
                : "bg-transparent border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
        )}>
            {icon}
            <span className="text-sm">{label}</span>
        </div>
    )

    if (href) return <Link href={href}>{content}</Link>
    return content
}

function UtilityButton({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    )
}

function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#0a0a0b]">
            <div className="flex flex-col items-center gap-4">
                <div className="size-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse uppercase tracking-widest">Loading Practice Test...</p>
            </div>
        </div>
    )
}

function EmptyState({ category }: { category: string }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] dark:bg-[#0a0a0b] p-6 text-center">
            <div className="size-32 rounded-[40px] bg-red-500/10 flex items-center justify-center mb-8 border-4 border-white dark:border-white/5 shadow-2xl">
                <AlertCircle className="size-16 text-red-500" />
            </div>
            <h1 className="text-4xl font-black mb-4 tracking-tighter">QUESTION BANK EMPTY</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg max-w-md mx-auto leading-relaxed">
                Our experts are currently curating premium content for this section. Please try another category!
            </p>
            <Link
                href={`/pte/practice/${category}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-12 rounded-3xl transition-all shadow-2xl shadow-blue-600/40 text-lg uppercase tracking-widest"
            >
                Explore Other Types
            </Link>
        </div>
    )
}
