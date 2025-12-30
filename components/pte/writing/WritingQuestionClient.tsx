'use client'

import { countWords } from '@/lib/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import WritingInput from './WritingInput'
import { AIScoringModal } from '@/components/pte/scoring/AIScoringModal'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { scoreWritingAttempt } from '@/app/actions/pte'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, BookText, Sparkles, RotateCcw, SendHorizontal, Loader2, AlertCircle, LayoutPanelLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import WritingResults from '@/app/practice/_componets/WritingResults'

type WritingQuestionClientProps = {
  question: {
    id: string
    type: QuestionType.WRITE_ESSAY | QuestionType.SUMMARIZE_WRITTEN_TEXT
    title: string
    promptText: string
  }
}

export default function WritingQuestionClient({
  question,
}: WritingQuestionClientProps) {
  const [text, setText] = useState('')
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiScore, setAiScore] = useState<AIFeedbackData | null>(null)
  const [timeLeft, setTimeLeft] = useState(question.type === QuestionType.WRITE_ESSAY ? 20 * 60 : 10 * 60)

  // Load draft from local storage
  useEffect(() => {
    const key = `pte-wr-draft:${question.id}`
    const saved = localStorage.getItem(key)
    if (saved) setText(saved)
  }, [question.id])

  // Save draft to local storage on change
  useEffect(() => {
    const key = `pte-wr-draft:${question.id}`
    const timer = setTimeout(() => {
      localStorage.setItem(key, text)
    }, 500)
    return () => clearTimeout(timer)
  }, [text, question.id])

  const handleSubmit = useCallback(async () => {
    if (!text || isScoring) return
    
    setError(null)
    setIsScoring(true)
    setAiScore(null)

    const wordCount = countWords(text)

    try {
      const result = await scoreWritingAttempt(
        question.promptText,
        text,
        wordCount
      )
      if (result.success) {
        setAiScore(result.feedback!)
        localStorage.removeItem(`pte-wr-draft:${question.id}`)
      } else {
        setError(result.error || 'Failed to get AI score.')
      }
    } catch (e) {
      setError('An unexpected error occurred while scoring.')
    } finally {
      setIsScoring(false)
    }
  }, [text, question.type, question.promptText, question.id, isScoring])

  // Timer effect
  useEffect(() => {
    if (isScoring || aiScore) return

    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timerId)
  }, [timeLeft, isScoring, aiScore, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (aiScore) {
    return (
        <div className="space-y-10">
            <WritingResults scoreData={aiScore} />
            <div className="flex justify-center">
                <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => { setAiScore(null); setTimeLeft(question.type === QuestionType.WRITE_ESSAY ? 20 * 60 : 10 * 60) }}
                    className="rounded-2xl font-black uppercase tracking-widest px-12 h-14"
                >
                    Practice Another
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="flex items-center justify-between p-6 bg-card/30 backdrop-blur-sm border border-border/40 rounded-[32px]">
        <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time Remaining</span>
                <span className={cn(
                    "text-xl font-black tabular-nums transition-colors",
                    timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-indigo-600"
                )}>
                    {formatTime(timeLeft)}
                </span>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</span>
                <Badge variant="outline" className="mt-1 rounded-lg font-black text-[9px] uppercase tracking-tighter border-indigo-500/20 bg-indigo-500/5 text-indigo-600">
                    {question.type === QuestionType.WRITE_ESSAY ? 'Essay Writing' : 'Summarize Text'}
                </Badge>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setText('')}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4"
            >
                <RotateCcw className="mr-2 size-3" />
                Clear Draft
            </Button>
            <Button 
                onClick={handleSubmit}
                disabled={!text || isScoring}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-indigo-500/20"
            >
                {isScoring ? (
                    <Loader2 className="mr-2 size-3 animate-spin" />
                ) : (
                    <SendHorizontal className="mr-2 size-3" />
                )}
                Submit Now
            </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-10">
        {/* Prompt Card */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] ml-2">
                <BookText className="size-4" />
                <span>Reading Passage & Prompt</span>
            </div>
            <Card className="border-border/40 rounded-[48px] bg-white dark:bg-[#121214] shadow-xl shadow-black/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Sparkles className="size-32" />
                </div>
                <CardContent className="p-10 md:p-14">
                    <p className="text-lg md:text-xl font-bold leading-relaxed text-foreground/80 selection:bg-indigo-500/10">
                        {question.promptText}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] ml-2">
                <LayoutPanelLeft className="size-4" />
                <span>Your Response</span>
            </div>
            <WritingInput
                questionType={question.type}
                value={text}
                onChange={setText}
                disabled={isScoring}
            />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-[32px] bg-rose-500/5 border-rose-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      )}

      {/* AI Scoring Modal */}
      <AIScoringModal
        open={isScoring}
        onOpenChange={() => {}}
        isScoring={isScoring}
        title="AI Scoring Your Response"
        description="Our PTE algorithm is currently evaluating your grammar, vocabulary, and structural development..."
      />
    </div>
  )
}
