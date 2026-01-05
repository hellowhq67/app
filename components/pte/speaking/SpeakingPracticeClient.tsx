'use client'

import React, { useState } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { Button } from '@/components/ui/button'
import { Mic, Square, Loader2, PlayCircle, RotateCcw } from 'lucide-react'
import { QuestionType, SpeakingFeedbackData } from '@/lib/types'
import { scoreReadAloudAttempt, scoreSpeakingAttempt } from '@/app/actions/pte'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface SpeakingPracticeClientProps {
    questionId: string
    questionType: QuestionType | string
    content: string
    timeLimit?: number // Seconds
}

export function SpeakingPracticeClient({
    questionId,
    questionType,
    content,
    timeLimit = 40
}: SpeakingPracticeClientProps) {
    const {
        isRecording,
        recordingTime,
        audioUrl,
        startRecording,
        stopRecording,
        audioBlob,
        resetRecording
    } = useAudioRecorder(timeLimit)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<SpeakingFeedbackData | null>(null)

    const handleStart = async () => {
        setFeedback(null)
        await startRecording()
    }

    const handleStop = () => {
        stopRecording()
    }

    const handleSubmit = async () => {
        if (!audioBlob) return

        setIsSubmitting(true)
        try {
            const formData = new FormData()
            // Convert blob to file
            const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

            let result
            if (questionType === 'READ_ALOUD' || questionType === 'read_aloud') {
                // Map string to enum if needed, assuming backend handles string matching or we cast
                // But scoreReadAloudAttempt takes specific args
                result = await scoreReadAloudAttempt(file, content, questionId)
            } else {
                // For other speaking types
                // Cast string to QuestionType if needed
                result = await scoreSpeakingAttempt(questionType as QuestionType, file, content, questionId)
            }

            if (result.success && result.feedback) {
                setFeedback(result.feedback)
                toast.success('Scoring complete!')
            } else {
                toast.error(result.error || 'Failed to score attempt')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred during submission')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-6 flex flex-col items-center gap-4">
                <div className="text-4xl font-mono font-bold text-gray-700 dark:text-gray-200">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex items-center gap-4">
                    {!isRecording && !audioBlob && (
                        <Button size="lg" onClick={handleStart} className="rounded-full w-48 h-12 gap-2 bg-red-500 hover:bg-red-600">
                            <Mic className="size-5" /> Start Recording
                        </Button>
                    )}

                    {isRecording && (
                        <Button size="lg" variant="destructive" onClick={handleStop} className="rounded-full w-48 h-12 gap-2 animate-pulse">
                            <Square className="size-5" /> Stop
                        </Button>
                    )}

                    {audioBlob && !isRecording && !isSubmitting && !feedback && (
                        <>
                            <Button variant="outline" size="lg" onClick={resetRecording} className="rounded-full h-12">
                                <RotateCcw className="size-5 mr-2" /> Retry
                            </Button>
                            <Button size="lg" onClick={handleSubmit} className="rounded-full w-48 h-12 bg-green-600 hover:bg-green-700 text-white">
                                Submit for Scoring
                            </Button>
                        </>
                    )}

                    {isSubmitting && (
                        <Button disabled size="lg" className="rounded-full w-48 h-12 gap-2">
                            <Loader2 className="size-5 animate-spin" /> Scoring...
                        </Button>
                    )}
                </div>

                {audioUrl && !isRecording && (
                    <audio src={audioUrl} controls className="w-full max-w-md mt-4" />
                )}
            </div>

            {/* AI Feedback */}
            {feedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-white dark:bg-[#1e1e20] border-gray-200 dark:border-white/10">
                        <CardHeader>
                            <CardTitle>AI Score</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Overall</span>
                                <span className="text-2xl font-bold text-blue-600">{feedback.overall}</span>
                            </div>
                            <Progress value={feedback.overall} className="h-2" />

                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase">Fluency</div>
                                    <div className="font-bold text-lg">{feedback.fluency}</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase">Pronunciation</div>
                                    <div className="font-bold text-lg">{feedback.pronunciation}</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase">Content</div>
                                    <div className="font-bold text-lg">{feedback.content}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#1e1e20] border-gray-200 dark:border-white/10">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[250px] overflow-y-auto">
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">{feedback.feedback}</p>
                            {feedback.mistakes && feedback.mistakes.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-red-500">Mistakes to avoid</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                        {feedback.mistakes.map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
