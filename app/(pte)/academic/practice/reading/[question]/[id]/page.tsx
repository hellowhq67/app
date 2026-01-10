import { notFound } from 'next/navigation'
import ReadingPracticeClient from '@/components/pte/reading/ReadingPracticeClient'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { getQuestionById } from '@/lib/pte/practice'
import { AccessGate } from '@/components/pte/AccessGate'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, BarChart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { ReadingQuestion } from '@/lib/types'

// Force dynamic since we're fetching individual question data that might change
export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        question: string
        id: string
    }>
}

export default async function ReadingPracticePage({ params }: PageProps) {
    const { question, id } = await params

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Fetch question with all details using helper
    const questionData = await getQuestionById(id) as ReadingQuestion;

    if (!questionData) {
        return notFound()
    }

    // User Tier Check (Mock logic for now, similar to Speaking Page)
    // You might want to extract this into a helper `getUserTier(userId)`
    const userTier = "free"; // Default

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href={`/academic/practice/reading/${question}`}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground"
                    >
                        <ArrowLeft className="size-4" /> Back to list
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    {questionData.isPremium && (
                        <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 gap-1"
                        >
                            Premium Question
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Wrapped in AccessGate */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{questionData.title}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-4">
                            {/* Time limit display if available */}
                            {questionData.questionType?.timeLimit && (
                                <span className="flex items-center gap-1">
                                    <Clock className="size-3" /> {Math.floor(questionData.questionType.timeLimit / 60)} mins
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <BarChart className="size-3" /> {questionData.difficulty}
                            </span>
                        </p>
                    </div>

                    <AccessGate isPremium={questionData.isPremium} userTier={userTier}>
                        <ReadingPracticeClient question={questionData} />
                    </AccessGate>
                </div>

                {/* Sidebar Info (Optional for Reading, but consistent) */}
                <div className="space-y-6">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                            Reading Tips
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            Read the instructions carefully. Manage your time effectively.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

