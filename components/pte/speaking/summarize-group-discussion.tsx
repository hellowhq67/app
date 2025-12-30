'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Volume2, AlertCircle, ArrowLeft, Play, Clock, Sparkles, Loader2, RotateCcw, CheckCircle, Users } from 'lucide-react'
import { useAudioRecorder } from '../hooks/use-audio-recorder'
import { scoreSpeakingAttempt } from '@/app/actions/pte'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { LiveWaveform } from '@/components/ui/live-waveform'
import { MicSelector } from '@/components/ui/mic-selector'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import SpeakingResults from '@/app/practice/_componets/SpeakingResults'

interface SummarizeGroupDiscussionProps {
    question: {
        id: string
        title: string
        promptText: string | null
        promptMediaUrl: string | null
        difficulty: string
    }
}

export function SummarizeGroupDiscussion({ question }: SummarizeGroupDiscussionProps) {
    const router = useRouter()
    const [stage, setStage] = useState<'idle' | 'playing' | 'recording' | 'processing' | 'complete'>('idle')
    const [transcript, setTranscript] = useState('')
    const [score, setScore] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        isRecording,
        recordingTime,
        audioLevel,
        error: recorderError,
        startRecording,
        stopRecording,
        resetRecording,
        playBeep,
    } = useAudioRecorder({
        maxDuration: 120000, // 2 minutes max
        onRecordingComplete: handleRecordingComplete,
    })

    async function handleRecordingComplete(blob: Blob, duration: number) {
        setStage('processing')
        try {
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)

            // Mock transcription
            setTimeout(() => {
                setTranscript("The group discussed the impact of remote work on urban planning and infrastructure development.")
                setStage('complete')
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to process recording')
            setStage('idle')
        }
    }

    const handlePlayDiscussion = () => {
        if (!question.promptMediaUrl) {
            handleStartRecording()
            return
        }
        setStage('playing')
        if (audioRef.current) {
            audioRef.current.play()
        }
    }

    const handleAudioEnded = () => {
        handleStartRecording()
    }

    const handleStartRecording = useCallback(async () => {
        playBeep()
        setStage('recording')
        await startRecording(selectedDeviceId)
    }, [startRecording, playBeep, selectedDeviceId])

    const handleStopRecording = useCallback(() => {
        playBeep(660, 200)
        stopRecording()
    }, [stopRecording, playBeep])

    const handleBegin = () => {
        setStage('idle')
        setError(null)
        setScore(null)
        resetRecording()
    }

    const handleSubmit = async () => {
        if (!audioUrl) return
        setIsSubmitting(true)
        try {
            const response = await fetch(audioUrl)
            const blob = await response.blob()
            const file = new File([blob], 'recording.webm', { type: 'audio/webm' })

            const result = await scoreSpeakingAttempt(
                'summarize_group_discussion' as any,
                file,
                question.promptText || question.title || '',
                question.id
            )

            if (result.success && result.feedback) {
                setScore({
                    overall: result.feedback.overallScore,
                    ...result.feedback
                })
                toast.success('Response scored!')
            } else {
                throw new Error(result.error || 'Submission failed')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit')
            toast.error('Submission failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatLongTime = (ms: number) => {
        const mins = Math.floor(ms / 60000)
        const secs = Math.floor((ms % 60000) / 1000)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (score) {
        return (
            <div className="space-y-8">
                <SpeakingResults scoreData={score} />
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleBegin}
                        className="rounded-2xl font-black uppercase tracking-widest px-12 h-14"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Info Bar */}
            <div className="flex items-center justify-between p-6 bg-card/30 backdrop-blur-sm border border-border/40 rounded-[32px]">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</span>
                        <span className="text-sm font-black flex items-center gap-1.5 text-primary">
                            Group Discussion
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Limit</span>
                        <span className="text-sm font-black flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            2:00
                        </span>
                    </div>
                </div>

                <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                    {question.difficulty || 'Medium'}
                </Badge>
            </div>

            {/* Task Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Sparkles className="size-4" />
                        <span>Summarize the conversation</span>
                    </div>

                    <Card className="border-border/40 rounded-[48px] bg-white dark:bg-[#121214] overflow-hidden shadow-xl shadow-black/5">
                        <CardContent className="p-8 md:p-12 space-y-8">
                            <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center">
                                <Users className="size-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight">{question.title}</h3>
                                {question.promptText && (
                                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/40">
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Discussion Topic</p>
                                        <p className="text-foreground/80 leading-relaxed font-medium">
                                            {question.promptText}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/40 rounded-[48px] bg-card/30 backdrop-blur-sm overflow-hidden border-none shadow-none lg:mt-11">
                    <CardContent className="p-8 md:p-12">
                        {question.promptMediaUrl && (
                            <audio ref={audioRef} src={question.promptMediaUrl} onEnded={handleAudioEnded} className="hidden" />
                        )}

                        <div className="relative">
                            {stage === 'idle' && (
                                <div
                                    key="idle"
                                    className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500"
                                >
                                    <div className="size-24 rounded-[32px] bg-primary/10 flex items-center justify-center mx-auto">
                                        <Volume2 className="size-12 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight">Ready to Listen?</h3>
                                        <p className="text-muted-foreground font-medium max-w-sm mx-auto">Hear the group discussion and provide a summary of the main points.</p>
                                    </div>
                                    <div className="max-w-xs mx-auto">
                                        <MicSelector value={selectedDeviceId} onValueChange={setSelectedDeviceId} />
                                    </div>
                                    <Button onClick={handlePlayDiscussion} size="lg" className="rounded-2xl font-black h-16 px-12 shadow-xl shadow-primary/20 text-lg">
                                        Start Discussion
                                    </Button>
                                </div>
                            )}

                            {stage === 'playing' && (
                                <div
                                    key="playing"
                                    className="space-y-8 text-center animate-in fade-in duration-500"
                                >
                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className="w-2 bg-primary rounded-full animate-bounce h-12"
                                                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.7s' }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xl font-black text-primary animate-pulse uppercase tracking-widest">Listening to Group...</p>
                                </div>
                            )}

                            {stage === 'recording' && (
                                <div
                                    key="recording"
                                    className="w-full space-y-10 animate-in fade-in duration-500"
                                >
                                    <div className="h-32 flex items-center justify-center">
                                        <LiveWaveform
                                            isActive={true}
                                            audioLevel={audioLevel}
                                            className="w-full h-full text-primary"
                                        />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-rose-500">
                                            <div className="size-2 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-sm font-black uppercase tracking-widest">Recording Summary</span>
                                        </div>
                                        <span className="text-6xl font-black tabular-nums">{formatLongTime(recordingTime)}</span>
                                        <Progress value={(recordingTime / 120000) * 100} className="h-2 max-w-xs mx-auto mt-4" />
                                    </div>
                                    <div className="flex justify-center">
                                        <Button
                                            variant="destructive"
                                            size="lg"
                                            onClick={handleStopRecording}
                                            className="rounded-full size-24 shadow-2xl shadow-rose-500/30"
                                        >
                                            <Square className="size-10 fill-current" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(stage === 'processing' || stage === 'complete') && (
                                <div
                                    key="processing"
                                    className="w-full space-y-8 animate-in fade-in duration-500"
                                >
                                    {stage === 'processing' ? (
                                        <div className="space-y-4 text-center">
                                            <Loader2 className="size-12 text-primary animate-spin mx-auto" />
                                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Evaluating Summary</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 max-w-md mx-auto">
                                            <div className="p-8 bg-muted/50 rounded-[40px] border border-border/40">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Your Response</p>
                                                <p className="text-lg font-bold italic text-foreground/80 leading-relaxed">&ldquo;{transcript}&rdquo;</p>
                                            </div>

                                            <div className="p-4 bg-background rounded-3xl border border-border/40">
                                                <audio src={audioUrl!} controls className="w-full" />
                                            </div>

                                            <div className="flex gap-4">
                                                <Button variant="outline" onClick={handleBegin} className="flex-1 rounded-2xl font-black h-14">
                                                    <RotateCcw className="mr-2 size-4" />
                                                    Retry
                                                </Button>
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="flex-1 rounded-2xl font-black h-14 shadow-xl shadow-primary/20"
                                                >
                                                    {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle className="mr-2 size-4" />}
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {recorderError && (
                <Alert variant="destructive" className="rounded-[32px] bg-rose-500/5 border-rose-500/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">{recorderError}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}