import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteQuestionTypes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PlayCircle, Lock } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        question: string
    }>
}

export default async function ReadingQuestionListPage({ params }: PageProps) {
    const { question: questionTypeCode } = await params

    // 1. Get the Question Type ID
    const questionType = await db.query.pteQuestionTypes.findFirst({
        where: eq(pteQuestionTypes.code, questionTypeCode as any),
    })

    if (!questionType) {
        return notFound()
    }

    // 2. Get Questions for this type
    const questions = await db.query.pteQuestions.findMany({
        where: eq(pteQuestions.questionTypeId, questionType.id),
        orderBy: [desc(pteQuestions.createdAt)],
    })

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/academic/practice/reading"
                    className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reading Practice
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{questionType.name}</h1>
                    <p className="text-muted-foreground">{questionType.description}</p>
                </div>
            </div>

            {/* Stats/Info Bar (Optional) */}
            <div className="flex gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg w-fit">
                <span>{questions.length} Questions Available</span>
                <span>•</span>
                <span>Time Limit: {questionType.timeLimit ? `${Math.floor(questionType.timeLimit / 60)} min` : 'N/A'}</span>
            </div>

            {/* Questions List */}
            <div className="grid gap-4 md:grid-cols-1">
                {questions.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No questions available for this type yet.</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <Link key={q.id} href={`/academic/practice/reading/${questionTypeCode}/${q.id}`}>
                            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <PlayCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">Question {questions.length - index}</h3>
                                                {q.isPremium && (
                                                    <Badge variant="secondary" className="text-xs gap-1">
                                                        <Lock className="h-3 w-3" /> VIP
                                                    </Badge>
                                                )}
                                                {!q.isActive && (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                {q.title}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Badge variant={q.difficulty === 'Hard' ? 'destructive' : q.difficulty === 'Medium' ? 'default' : 'secondary'} className="capitalize">
                                            {q.difficulty}
                                        </Badge>
                                        <Button variant="ghost" size="sm">Start Practice</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
