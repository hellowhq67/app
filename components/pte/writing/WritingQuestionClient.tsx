'use client'

import { countWords } from '@/lib/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import AiScoreDisplay from './AiScoreDisplay'
import WritingInput from './WritingInput'
import { AIScoringModal } from '@/components/pte/scoring/AIScoringModal'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { scoreWritingAttempt } from '@/app/actions/pte'

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
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutes

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
    setError(null)
    setIsScoring(true)
    setAiScore(null)

    const wordCount = countWords(text)
    if (question.type === QuestionType.WRITE_ESSAY) {
      if (wordCount < 200 || wordCount > 300) {
        // This is a warning, not a hard stop, as the AI will score the `Form` criterion.
        console.warn('Word count is outside the recommended 200-300 range.')
      }
    }

    try {
      const result = await scoreWritingAttempt(
        question.promptText,
        text,
        wordCount
      )
      if (result.success) {
        setAiScore(result.feedback!)
      } else {
        setError(result.error || 'Failed to get AI score.')
      }
    } catch (e) {
      setError('An unexpected error occurred while scoring.')
    } finally {
      setIsScoring(false)
    }
  }, [text, question.type, question.promptText])

  // Timer effect
  useEffect(() => {
    if (isScoring) return

    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timerId)
  }, [timeLeft, isScoring, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{question.title}</h2>
        <div className="prose prose-sm max-w-none">
          <p>{question.promptText}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <WritingInput
          value={text}
          onChange={setText}
          disabled={isScoring}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!text || isScoring}
            >
              {isScoring ? 'Scoring...' : 'Submit for AI Score'}
            </Button>
            <Button
              variant="outline"
              disabled={isScoring}
              onClick={() => setText('')}
            >
              Clear
            </Button>
          </div>
          <div className="font-mono text-lg">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* AI Scoring Modal */}
      <AIScoringModal
        open={isScoring}
        onOpenChange={() => {}}
        isScoring={isScoring}
        title="AI Scoring Your Essay"
        description="Analyzing grammar, vocabulary, content, and structure..."
      />

      {aiScore && <AiScoreDisplay scoreData={aiScore} userText={text} />}
    </div>
  )
}