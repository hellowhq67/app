'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic,
    PenTool,
    BookOpen,
    Headphones,
    ChevronLeft,
    ChevronRight,
    Search as SearchIcon,
    Filter,
    Clock,
    Star,
    LayoutGrid,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const iconMap: { [key: string]: any } = {
    speaking: Mic,
    writing: PenTool,
    reading: BookOpen,
    listening: Headphones,
}

export default function PteCategoryPracticePage() {
    const { category } = useParams() as { category: string }
    const [categoryData, setCategoryData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'unattempted' | 'finished'>('all')
    const router = useRouter()

    useEffect(() => {
        async function fetchCategoryData() {
            try {
                const response = await fetch('/api/pte/categories')
                const data = await response.json()

                if (data.success) {
                    const found = data.data.find((c: any) => c.code === category)
                    if (found) {
                        setCategoryData(found)
                    }
                }
            } catch (error) {
                console.error('Error fetching category data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCategoryData()
    }, [category])

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!categoryData) return null

    const Icon = iconMap[category] || LayoutGrid

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Title & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize flex items-center gap-3">
                        <Icon className="size-8 text-blue-600 dark:text-blue-400" />
                        {categoryData.name} Section
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{categoryData.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search question types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-[240px] transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
                        <Filter className="size-4" />
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-200/50 dark:bg-white/5 rounded-2xl w-fit">
                {['all', 'unattempted', 'finished'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setStatusFilter(tab as any)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            statusFilter === tab
                                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Question Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryData.questionTypes?.filter((t: any) => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map((type: any, index: number) => {
                    const hasAI = ['READ_ALOUD', 'REPEAT_SENTENCE', 'DESCRIBE_IMAGE', 'RE_TELL_LECTURE', 'WRITING', 'WRITE_ESSAY', 'SUMMARIZE_SPOKEN_TEXT', 'SUMMARIZE_WRITTEN_TEXT'].some(code => type.code?.includes(code))

                    return (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="group relative"
                        >
                            <Link href={`/pte/practice/${category}/${type.code}`} className="block h-full">
                                <div className="h-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[28px] p-6 transition-all hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                                    {/* Header Info */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "size-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-sm",
                                            category === 'speaking' ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600" :
                                                category === 'writing' ? "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600" :
                                                    category === 'reading' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600" :
                                                        "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-600"
                                        )}>
                                            <Icon className="size-6" />
                                        </div>

                                        {hasAI && (
                                            <div className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-blue-500/20">
                                                AI Score
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {type.name}
                                    </h3>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6 flex-grow">
                                        {type.description || "Master this section with interactive practice and feedback."}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Clock className="size-3 text-blue-500" />
                                            {type.timeLimit ? `${type.timeLimit}s` : 'Varies'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Star className="size-3 text-yellow-500 fill-yellow-500" />
                                            Trial
                                        </div>
                                    </div>

                                    {/* Hover Reveal Button */}
                                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-[0.02] pointer-events-none transition-opacity duration-300" />
                                    <div className="absolute bottom-6 right-6 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40">
                                            <ChevronRight className="size-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}