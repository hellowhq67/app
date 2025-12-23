'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Mic, Square, Volume2, RotateCcw, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { ScoringProgressModal } from './scoring-progress-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SpeakingFeedbackData, QuestionType } from '@/lib/types'
import { scoreReadAloudAttempt } from '@/app/actions/pte'
import SpeakingScoreDisplay from './SpeakingScoreDisplay' // This component will be created next

interface ReadAloudProps {
    question: {
        id: string
        type: QuestionType.READ_ALOUD
        title?: string | null
        promptText: string
        difficulty?: string | null
    }
}

type Phase = 'idle' | 'preparing' | 'beep' | 'recording' | 'finished' | 'submitting' | 'scored'

const PREP_TIME = 30 // Preparation time in seconds
const RECORDING_TIME = 40 // Recording time in seconds

export function ReadAloud({ question }: ReadAloudProps) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [timeLeft, setTimeLeft] = useState(PREP_TIME) // Preparation timer
    const [recordingTime, setRecordingTime] = useState(0) // Recording timer
    const [totalTime, setTotalTime] = useState(0) // Total time spent on task
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isScoringModalOpen, setIsScoringModalOpen] = useState(false)
    const [aiFeedback, setAiFeedback] = useState<SpeakingFeedbackData | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const totalTimerRef = useRef<NodeJS.Timeout | null>(null)
    const beepAudioRef = useRef<HTMLAudioElement | null>(null)

    // Effect for beep sound and cleanup
    useEffect(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const createBeep = () => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            osc.connect(gain)
            gain.connect(audioContext.destination)
            osc.frequency.value = 800
            osc.type = 'sine'
            gain.gain.value = 0.3
            osc.start()
            osc.stop(audioContext.currentTime + 0.2)
        }
        beepAudioRef.current = { play: createBeep } as any

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
    }, [])

    // Effect for total timer
    useEffect(() => {
        if (phase === 'preparing' || phase === 'recording') {
            totalTimerRef.current = setInterval(() => {
                setTotalTime((t) => t + 1)
            }, 1000)
        } else {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
        return () => {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        }
    }, [phase])

    const playBeepAndStartRecording = useCallback(() => {
        setPhase('beep')
        beepAudioRef.current?.play()
        setTimeout(() => startRecording(), 500)
    }, [])

    const startPractice = useCallback(() => {
        setPhase('preparing')
        setTimeLeft(PREP_TIME)
        setTotalTime(0)
        setSubmitError(null)
        setAiFeedback(null)

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current)
                    playBeepAndStartRecording()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [playBeepAndStartRecording])

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }) // Specify mimeType
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                setPhase('finished')
            }

            mediaRecorder.start()
            setPhase('recording')
            setRecordingTime(0)

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= RECORDING_TIME - 1) {
                        stopRecording()
                        return RECORDING_TIME
                    }
                    return prev + 1
                })
            }, 1000)
        } catch (err) {
            console.error('Error accessing microphone:', err)
            toast.error('Could not access microphone. Please check permissions.')
            setPhase('idle')
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (mediaRecorderRef.current && phase === 'recording') {
            beepAudioRef.current?.play() // Play ending beep
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }, [phase])

    const handleSubmit = useCallback(async () => {
        if (!audioBlob) {
            setSubmitError('No audio recorded to submit.')
            return
        }

        setPhase('submitting')
        setIsScoringModalOpen(true)
        setSubmitError(null)
        setAiFeedback(null)

        try {
            // Call the new server action
            const result = await scoreReadAloudAttempt(audioBlob, question.promptText, question.id)

            if (result.success) {
                setAiFeedback(result.feedback)
                setPhase('scored')
                toast.success('Your response has been submitted and scored!')
            } else {
                setSubmitError(result.error || 'Failed to get AI score.')
                setPhase('finished')
            }
        } catch (error: any) {
            console.error('Submit error:', error)
            setSubmitError(error.message || 'Failed to submit. Please try again.')
            setPhase('finished')
        } finally {
            setIsScoringModalOpen(false)
        }
    }, [audioBlob, question.promptText, question.id])

    const handleReset = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }

        setPhase('idle')
        setTimeLeft(PREP_TIME)
        setRecordingTime(0)
        setTotalTime(0)
        setAudioBlob(null)
        setAudioUrl(null)
        setAiFeedback(null)
        setSubmitError(null)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getPhaseText = () => {
        switch (phase) {
            case 'idle': return 'Ready to start'
            case 'preparing': return `Prepare: ${timeLeft}s`
            case 'beep': return 'Starting...'
            case 'recording': return `Recording: ${recordingTime}s / ${RECORDING_TIME}s`
            case 'finished': return 'Recording complete'
            case 'submitting': return 'Submitting...'
            case 'scored': return 'Scored!'
            default: return ''
        }
    }

    const isSubmitting = phase === 'submitting';

    return (
        <div className="space-y-6">
            {/* Timer and Difficulty */}
            <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${(phase === 'preparing' || phase === 'recording') ? 'text-red-500' : 'text-muted-foreground'}`}>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Time: {formatTime(totalTime)}
                </div>
                {question.difficulty && (
                    <Badge variant="outline" className="capitalize">
                        {question.difficulty}
                    </Badge>
                )}
            </div>

            {/* Instructions */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Please examine the text provided below. You are required to read it out loud as naturally as you can. Remember, you only have {RECORDING_TIME} seconds to complete this task.
                </AlertDescription>
            </Alert>

            {/* Text to read */}
            <div className="p-6 bg-white dark:bg-muted/30 rounded-lg border border-border/50">
                <p className="text-base leading-relaxed text-gray-900 dark:text-foreground">
                    {question.promptText || question.title}
                </p>
            </div>

            {/* Recording Area */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{getPhaseText()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {phase !== 'scored' ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-8">
                            {/* Progress Bars */}
                            {phase === 'preparing' && (
                                <div className="w-full max-w-md space-y-2">
                                    <Progress value={((PREP_TIME - timeLeft) / PREP_TIME) * 100} className="h-2" />
                                    <p className="text-sm text-center text-muted-foreground">
                                        Prepare to read aloud...
                                    </p>
                                </div>
                            )}

                            {phase === 'recording' && (
                                <div className="w-full max-w-md space-y-2">
                                    <Progress value={(recordingTime / RECORDING_TIME) * 100} className="h-2" />
                                    <p className="text-sm text-center text-muted-foreground">
                                        Recording...
                                    </p>
                                </div>
                            )}

                            {/* Control Buttons */}
                            {phase === 'idle' && (
                                <Button size="lg" onClick={startPractice} className="h-24 w-24 rounded-full">
                                    <Volume2 className="h-10 w-10" />
                                </Button>
                            )}

                            {phase === 'recording' && (
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    onClick={stopRecording}
                                    className="h-24 w-24 rounded-full animate-pulse"
                                >
                                    <Square className="h-10 w-10" />
                                </Button>
                            )}

                            {phase === 'finished' && audioUrl && (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <audio controls src={audioUrl} className="w-full max-w-md" />
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleReset}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Retry
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {submitError && (
                                        <p className="text-sm text-red-500">{submitError}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Display AI Score and Feedback
                        aiFeedback && (
                            <div className="space-y-6">
                                <SpeakingScoreDisplay scoreData={aiFeedback} />
                                <Button className="w-full" variant="outline" onClick={handleReset}>
                                    Practice Again
                                </Button>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            {/* Scoring Progress Modal */}
            <ScoringProgressModal
                open={isScoringModalOpen}
                onOpenChange={setIsScoringModalOpen}
            />
        </div>
    )
}