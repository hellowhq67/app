'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import ReadingInput from './ReadingInput'
import { AIScoringModal } from '@/components/pte/scoring/AIScoringModal'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { scoreReadingAttempt } from '@/app/actions/pte'
import ReadingScoreDisplay from './ReadingScoreDisplay' // Will create this component next

type ReadingQuestionClientProps = {
  question: {
    id: string
    type:
      | QuestionType.MULTIPLE_CHOICE_SINGLE
      | QuestionType.MULTIPLE_CHOICE_MULTIPLE
      | QuestionType.REORDER_PARAGRAPHS
      | QuestionType.READING_BLANKS
      | QuestionType.READING_WRITING_BLANKS
    title?: string | null
    promptText: string
    questionData?: {
      options?: string[]
      paragraphs?: string[]
      wordBank?: string[]
      blanks?: { index: number; answer: string }[] // For fill in the blanks
      answerKey: any
    }
  }
}

export default function ReadingQuestionClient({
  question,
}: ReadingQuestionClientProps) {
  const [userResponse, setUserResponse] = useState<any>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackData | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Ensure answerKey is available
  const answerKey = question.questionData?.answerKey
  if (!answerKey) {
    console.error('Answer key is missing for question:', question.id)
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-md border p-4 text-sm text-red-600"
        >
          Error: Answer key not found for this question.
        </div>
      </div>
    )
  }

  const onResponseChange = useCallback((response: any) => {
    setError(null)
    setUserResponse(response)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!userResponse) {
      setError('Please provide an answer first.')
      return
    }
    setError(null)
    setIsScoring(true)
    setAiFeedback(null)

    try {
      const result = await scoreReadingAttempt(
        question.type,
        question.promptText,
        question.questionData?.options,
        question.questionData?.paragraphs,
        answerKey,
        userResponse
      )

      if (result.success) {
        setAiFeedback(result.feedback!)
      } else {
        setError(result.error || 'Failed to get AI score.')
      }
    } catch (e) {
      console.error('Error scoring reading attempt:', e)
      setError('An unexpected error occurred while scoring.')
    } finally {
      setIsScoring(false)
    }
  }, [
    userResponse,
    question.type,
    question.promptText,
    question.questionData?.options,
    question.questionData?.paragraphs,
    answerKey,
  ])

  const handleReset = useCallback(() => {
    setUserResponse(null)
    setAiFeedback(null)
    setError(null)
    setIsScoring(false)
    setStartTime(Date.now()) // Reset timer
  }, [])

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{question.title}</h2>
        <div className="prose prose-sm max-w-none">
          <p>{question.promptText}</p>
        </div>
      </div>

      {/* Input Component */}
      <div className="space-y-3 rounded-md border p-4">
        <ReadingInput
          questionType={question.type}
          question={question.questionData} // Pass questionData for input rendering
          value={userResponse}
          onChange={onResponseChange}
          disabled={isScoring}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            aria-label="Submit attempt"
            onClick={handleSubmit}
            disabled={!userResponse || isScoring}
          >
            {isScoring ? 'Scoring…' : 'Submit for AI Score'}
          </Button>
          <Button
            aria-label="Clear answer"
            variant="outline"
            onClick={handleReset}
            disabled={isScoring}
          >
            Clear
          </Button>
        </div>

        {error ? (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!userResponse && !aiFeedback && (
          <p className="text-muted-foreground text-xs">
            Provide your answer, then click Submit to get AI scoring.
          </p>
        )}
      </div>

      {/* AI Scoring Modal */}
      <AIScoringModal
        open={isScoring}
        onOpenChange={() => {}}
        isScoring={isScoring}
        title="AI Scoring Your Response"
        description="Analyzing accuracy, comprehension, and reading skills..."
      />

      {aiFeedback && <ReadingScoreDisplay scoreData={aiFeedback} />}
    </div>
  )
}