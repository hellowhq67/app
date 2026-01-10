'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import ReadingInput from './ReadingInput'
import { AnswerData, AIFeedbackData, ReadingQuestion, QuestionType } from '@/lib/types'
import { scoreReadingAttempt } from '@/app/actions/pte'
import { CountdownTimer } from '@/components/pte/timers/CountdownTimer'
import { ReadingScoreModal } from './ReadingScoreModal'

interface ReadingPracticeClientProps {
    question: ReadingQuestion
}

export default function ReadingPracticeClient({ question }: ReadingPracticeClientProps) {
    const router = useRouter()
    const [answer, setAnswer] = useState<AnswerData | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<AIFeedbackData | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

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
            let typeEnum: any = question.questionType?.code

            // Prepare response data based on type
            let userResponse: any = null
            
            // Map AnswerData to what the action expects
            userResponse = answer

            const result = await scoreReadingAttempt(
                typeEnum as any,
                question.reading?.questionText || question.content || '',
                question.id,
                question.reading?.options?.choices as string[],
                question.reading?.options?.paragraphs as string[],
                question.reading?.correctAnswerPositions, // answerKey
                userResponse
            )

            if (result.success) {
                setFeedback(result.feedback || null)
                setIsModalOpen(true)
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
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Badge variant="outline">{question.questionType?.name}</Badge>
                </div>
                <CountdownTimer
                    initialSeconds={question.questionType?.timeLimit || 600}
                    onComplete={() => {
                        toast({
                            title: "Time's up!",
                            description: "Submitting your answer automatically.",
                        });
                        handleSubmit();
                    }}
                />
            </div>

            <div className="grid gap-6">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>{question.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Image */}
                        {question.imageUrl && (
                            <div className="mb-6 rounded-lg overflow-hidden border flex justify-center bg-muted/10">
                                <Image
                                    src={question.imageUrl}
                                    alt="Question Image"
                                    width={600}
                                    height={400}
                                    className="max-h-[400px] w-auto object-contain"
                                />
                            </div>
                        )}

                        {/* Passage */}
                        {question.reading?.passageText && (
                            <div className="prose dark:prose-invert max-w-none mb-8 p-4 bg-muted/30 rounded-lg">
                                {question.reading.passageText}
                            </div>
                        )}

                        {/* Question Input */}
                        <ReadingInput
                            questionType={question.questionType?.code || question.questionTypeId}
                            question={{
                                id: question.id,
                                title: question.title,
                                promptText: question.reading?.questionText || question.content,
                                options: question.reading?.options?.choices || question.reading?.options?.options || question.reading?.options,
                                paragraphs: question.reading?.options?.paragraphs,
                                textWithBlanks: question.reading?.passageText
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

                <ReadingScoreModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    feedback={feedback}
                    onRetry={() => {
                        setIsModalOpen(false)
                        setFeedback(null)
                        setAnswer(null)
                    }}
                    onNext={() => router.back()}
                />
            </div>
        </div>
    )
}
