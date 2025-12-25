'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    Mic,
    PenTool,
    BookOpen,
    Headphones,
    ArrowRight,
    Sparkles,
    Star,
    Layout,
    Clock,
    Trophy,
    History,
    ChevronRight,
    Search,
    Bell,
    Settings,
    User,
    ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
    {
        id: 'speaking',
        name: 'Speaking',
        description: 'Fluency, Pronunciation & Oral Skills',
        icon: Mic,
        color: 'from-blue-600 to-blue-400',
        cardBg: 'bg-blue-50/50 dark:bg-blue-500/5',
        href: '/pte/practice/speaking',
        count: 7,
    },
    {
        id: 'writing',
        name: 'Writing',
        description: 'Grammar, Structure & Vocabulary',
        icon: PenTool,
        color: 'from-purple-600 to-purple-400',
        cardBg: 'bg-purple-50/50 dark:bg-purple-500/5',
        href: '/pte/practice/writing',
        count: 2,
    },
    {
        id: 'reading',
        name: 'Reading',
        description: 'Comprehension & Speed Reading',
        icon: BookOpen,
        color: 'from-emerald-600 to-emerald-400',
        cardBg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
        href: '/pte/practice/reading',
        count: 5,
    },
    {
        id: 'listening',
        name: 'Listening',
        description: 'Lecture Understanding & Accents',
        icon: Headphones,
        color: 'from-orange-600 to-orange-400',
        cardBg: 'bg-orange-50/50 dark:bg-orange-500/5',
        href: '/pte/practice/listening',
        count: 8,
    },
]

export default function PtePracticePage() {
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

                <div className="flex items-center gap-3">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                        <input
                            type="text"
                            placeholder="Search exam types..."
                            className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-full text-xs focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 w-[200px]"
                        />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Bell className="size-5" />
                    </button>
                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-800">
                        JD
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hidden lg:flex flex-col p-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Core Sections</div>
                    <div className="space-y-1 mb-8">
                        {[
                            { icon: Layout, label: 'Overview', active: true },
                            { icon: ClipboardList, label: 'Full Mock Tests' },
                            { icon: History, label: 'Study History' },
                            { icon: Star, label: 'Flashcards' }
                        ].map(item => (
                            <div
                                key={item.label}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                                    item.active
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                                )}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Practice Type</div>
                    <div className="space-y-1">
                        {categories.map(item => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                            >
                                <item.icon className="size-4" />
                                {item.label || item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto p-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[28px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-24 bg-white/10 blur-2xl -mr-8 -mt-8" />
                        <h4 className="font-bold text-sm mb-1 relative z-10 font-sans">Upgrade to Pro</h4>
                        <p className="text-[10px] opacity-80 mb-4 relative z-10 leading-relaxed font-medium">Get unlimited AI feedback and full mock simulations.</p>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative z-10 border border-white/20">
                            Upgrade Now
                        </button>
                    </div>
                </aside>

                {/* Main Dashboard */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
                    <div className="max-w-6xl mx-auto space-y-10">
                        {/* Welcome Banner */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Practice Center</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Select a category to sharpen your skills with AI-powered feedback.</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
                                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Academic</button>
                                <button className="px-6 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold uppercase tracking-widest">Core (General)</button>
                            </div>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ y: -4 }}
                                    className="group"
                                >
                                    <Link href={category.href} className="block h-full">
                                        <div className={cn(
                                            "h-full p-8 rounded-[40px] border border-gray-100 dark:border-white/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-500/5 relative overflow-hidden flex flex-col",
                                            category.cardBg || "bg-white dark:bg-[#121214]"
                                        )}>
                                            <div className={cn(
                                                "size-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-500",
                                                category.color
                                            )}>
                                                <category.icon className="size-7 text-white" />
                                            </div>

                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{category.name}</h3>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{category.count} Question Types</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-8">{category.description}</p>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="size-6 rounded-full border-2 border-white dark:border-[#121214] bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-gray-500">JD</div>
                                                    ))}
                                                    <div className="size-6 rounded-full border-2 border-white dark:border-[#121214] bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">+12</div>
                                                </div>
                                                <div className="size-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                                                    <ChevronRight className="size-5" />
                                                </div>
                                            </div>

                                            {/* Decorative glow */}
                                            <div className={cn(
                                                "absolute -inset-1 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity blur-2xl -z-10",
                                                category.color
                                            )} />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Secondary Section - Mock Tests & Recent */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Promo Card */}
                            <div className="lg:col-span-2 relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-10 md:p-12 text-white border border-white/10 shadow-2xl">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] -ml-20 -mb-20 pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="max-w-md space-y-6">
                                        <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-[0.2em] text-xs">
                                            <Sparkles className="size-4" />
                                            <span>Official Test Engine</span>
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight leading-tight md:text-4xl">Full-length Mock Test Simulation</h2>
                                        <p className="text-gray-400 font-medium text-lg leading-relaxed">Simulate the real PTE exam environment and get a predictive score report with AI analysis.</p>
                                        <Link
                                            href="/pte/mock-tests"
                                            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-[20px] transition-all shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 group"
                                        >
                                            Start Simulation
                                            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                    <div className="relative hidden md:block">
                                        <div className="size-56 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[48px] rotate-12 flex items-center justify-center border border-white/20 shadow-[0_0_80px_rgba(37,99,235,0.3)] group-hover:rotate-6 transition-transform duration-700">
                                            <ClipboardList className="size-24 text-white opacity-90" />
                                        </div>
                                        <div className="absolute -bottom-6 -left-6 size-24 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center -rotate-12 shadow-2xl">
                                            <Trophy className="size-10 text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity / Stats Sidebar */}
                            <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/10 rounded-[40px] p-8 space-y-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Recent Results</h3>
                                    <Link href="/pte/history" className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">View All</Link>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { type: 'Read Aloud', score: 82, date: 'Today', color: 'text-blue-500' },
                                        { type: 'Essay', score: 74, date: 'Yesterday', color: 'text-purple-500' },
                                        { type: 'Summarize Text', score: 68, date: '2 days ago', color: 'text-orange-500' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <History className="size-4 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">{item.type}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.date}</p>
                                                </div>
                                            </div>
                                            <div className={cn("text-lg font-black", item.color)}>
                                                {item.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Score</span>
                                        <span className="text-xs font-black text-gray-900 dark:text-white">79 / 90</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-[85%] rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
