'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Mic,
    PenTool,
    BookOpen,
    Headphones,
    ChevronRight,
    Search as SearchIcon,
    Star,
    LayoutGrid,
    Clock,
    AlertCircle
} from 'lucide-react'
import { UnifiedQuestionsTable, UnifiedQuestion } from '@/components/pte/unified-questions-table'
import { cn } from '@/lib/utils'

const iconMap: { [key: string]: any } = {
    speaking: Mic,
    writing: PenTool,
    reading: BookOpen,
    listening: Headphones,
}

interface TypeQuestionListProps {
    category: string
    type: string
}

export function TypeQuestionList({ category, type }: TypeQuestionListProps) {
    const router = useRouter()
    const [questions, setQuestions] = useState<UnifiedQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [typeName, setTypeName] = useState('')
    const [typeDescription, setTypeDescription] = useState('')

    const Icon = iconMap[category] || LayoutGrid

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Type Info (for title/description)
                // We can fetch categories to find the type info
                const catsRes = await fetch('/api/pte/categories')
                const catsData = await catsRes.json()
                if (catsData.success) {
                    const cat = catsData.data.find((c: any) => c.code === category)
                    if (cat) {
                        const t = cat.questionTypes.find((t: any) => t.code === type)
                        if (t) {
                            setTypeName(t.name)
                            setTypeDescription(t.description)
                        }
                    }
                }

                // Fetch Questions
                const qRes = await fetch(`/api/pte/questions?type=${encodeURIComponent(type)}`)
                const qData = await qRes.json()
                
                if (qData.success) {
                    // Map API data to UnifiedQuestion format
                    // Note: API currently doesn't return user-specific status (bookmarked, practiced)
                    // We would need an enhanced API for that. For now mapping what we have.
                    const mapped: UnifiedQuestion[] = qData.data.map((q: any) => ({
                        id: q.id,
                        title: q.title,
                        type: type, // q.questionTypeId is uuid, we use the code passed in prop
                        difficulty: q.difficulty,
                        bookmarked: false, // Placeholder
                        practiceCount: q.usageCount || 0,
                        isLocked: q.isPremium,
                        practiced: false, // Placeholder
                        tags: q.tags || []
                    }))
                    setQuestions(mapped)
                }
            } catch (error) {
                console.error('Failed to fetch data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [category, type])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#0a0a0b]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse uppercase tracking-widest">Loading Content...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0a0a0b] flex flex-col font-sans">
            {/* Premium Header */}
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
                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hidden lg:flex flex-col p-4">
                    <div className="space-y-1 mb-8">
                        <Link href={`/pte/practice/${category}`} className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors">
                            <ChevronRight className="size-4 rotate-180" />
                            <span className="text-sm font-bold">Back to {category}</span>
                        </Link>
                    </div>

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Categories</div>
                    <div className="space-y-1">
                        {[
                            { id: 'speaking', icon: Mic, label: 'Speaking' },
                            { id: 'writing', icon: PenTool, label: 'Writing' },
                            { id: 'reading', icon: BookOpen, label: 'Reading' },
                            { id: 'listening', icon: Headphones, label: 'Listening' }
                        ].map(item => (
                            <Link
                                key={item.id}
                                href={`/pte/practice/${item.id}`}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                    category === item.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                                )}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <Link href="/pte/dashboard" className="hover:text-blue-600">PTE</Link>
                            <ChevronRight className="size-3" />
                            <Link href="/pte/practice" className="hover:text-blue-600">Practice</Link>
                            <ChevronRight className="size-3" />
                            <Link href={`/pte/practice/${category}`} className="capitalize hover:text-blue-600">{category}</Link>
                            <ChevronRight className="size-3" />
                            <span className="font-bold text-gray-900 dark:text-white capitalize">{typeName || type.replace(/_/g, ' ')}</span>
                        </div>

                        {/* Title Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <Icon className="size-8 text-blue-600 dark:text-blue-400" />
                                    {typeName || type.replace(/_/g, ' ')}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">{typeDescription || `Practice your ${typeName} skills with our extensive question bank.`}</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold">
                                    <Clock className="size-4" />
                                    <span>Time Limit: Varies</span>
                                </div>
                            </div>
                        </div>

                        {/* Question List Table */}
                        <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[24px] p-6 shadow-sm">
                            <UnifiedQuestionsTable 
                                questions={questions}
                                section={category as any}
                                questionType={type}
                                basePath={`/pte/practice/${category}/${type}/question`}
                                showFilters={true}
                                showBookmark={true}
                                showCount={true}
                                showLock={true}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
