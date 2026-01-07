'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import ReadingInput from './ReadingInput'
import { AnswerData, QuestionData, QuestionType } from '@/lib/types'
import { scoreReadingAttempt } from '@/app/actions/pte'

interface ReadingPracticeClientProps {
    question: {
        id: string
        title: string
        content: string | null
        promptText: string | null
        questionTypeId: string
        questionType: {
            code: string
            name: string
        }
        reading: {
            options: any
            passageText: string
            questionText: string | null
            correctAnswerPositions: number[] | null
        } | null
    }
}

export default function ReadingPracticeClient({ question }: ReadingPracticeClientProps) {
    const router = useRouter()
    const [answer, setAnswer] = useState<AnswerData | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<any>(null)

    const handleAnswerChange = (val: AnswerData) => {
        setAnswer(val)
    }

    const handleSubmit = async () => {
        if (!answer) {
            toast({
                title: "No answer provided",
                description: "Please answer the question before submitting.",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)
        try {
            // Determine question type enum from code
            let typeEnum: any = question.questionType.code

            // Map code to enum if needed (though strings might work if matched)
            // The action expects QuestionType enum values string

            // Prepare response data based on type
            let userResponse: any = null
            let answerKey: any = null

            // This logic depends on the specific question type structures
            // For now, passing the whole answer object
            userResponse = answer

            // Answer Key extraction (this should ideally be server-side but for practice mode we might have it)
            // In a real secure environment, verify on server. Here we pass it for the "Auto Scored" action helper if needed,
            // but predominantly the AI/Server should know the answer.
            // The action `scoreReadingAttempt` signature requires `answerKey`.
            // We'll pass what we have from the DB `reading.options` or `reading.correctAnswerPositions`

            const result = await scoreReadingAttempt(
                typeEnum,
                question.reading?.questionText || question.content || '',
                question.id,
                question.reading?.options?.choices as string[],
                question.reading?.options?.paragraphs as string[],
                question.reading?.correctAnswerPositions, // answerKey
                userResponse
            )

            if (result.success) {
                setFeedback(result.feedback)
                toast({
                    title: "Submitted successfully",
                    description: "Your answer has been scored.",
                })
            } else {
                toast({
                    title: "Submission failed",
                    description: result.error || "Unknown error",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to submit answer",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2">
                    <Badge variant="outline">{question.questionType.name}</Badge>
                    {/* Timer could go here */}
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>{question.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Passage */}
                        {question.reading?.passageText && (
                            <div className="prose dark:prose-invert max-w-none mb-8 p-4 bg-muted/30 rounded-lg">
                                {question.reading.passageText}
                            </div>
                        )}

                        {/* Question Input */}
                        <ReadingInput
                            questionType={question.questionType.code}
                            question={{
                                id: question.id,
                                title: question.title,
                                promptText: question.reading?.questionText || question.content,
                                options: question.reading?.options?.choices || question.reading?.options?.options || question.reading?.options,
                                paragraphs: question.reading?.options?.paragraphs,
                                // For FIB types where text contains blanks
                                textWithBlanks: question.reading?.passageText
                                // Note: Some schemas might store textWithBlanks in content/promptText. Adjust based on real data.
                            }}
                            value={answer}
                            onChange={handleAnswerChange}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                        <Button variant="outline">Save for Later</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit
                        </Button>
                    </CardFooter>
                </Card>

                {/* Feedback Section */}
                {feedback && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                        <CardHeader>
                            <CardTitle className="text-green-800 dark:text-green-300">Feedback & Score</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-green-700 dark:text-green-400">
                                    {feedback.overallScore} / 90
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Overall Score
                                </div>
                            </div>

                            {feedback.suggestions && feedback.suggestions.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Suggestions</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {feedback.suggestions.map((s: string, i: number) => (
                                            <li key={i} className="text-sm">{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
