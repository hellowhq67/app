'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Attempt = {
  id: string
  userResponse: any
  scores: any
  timeTaken: number | null
  createdAt: string
  question: {
    id: string
    title: string | null
    type: string
    difficulty: string | null
  }
}

type Props = {
  questionId?: string
}

export default function ListeningAttemptsList({ questionId }: Props) {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (questionId) params.set('questionId', questionId)
        params.set('pageSize', '10')

        const res = await fetch(`/api/listening/attempts?${params}`)
        if (!res.ok) {
          if (res.status === 401) {
            setAttempts([])
            return
          }
          throw new Error(`Failed to load attempts (${res.status})`)
        }
        const data = await res.json()
        setAttempts(data.items || [])
      } catch (e: any) {
        setError(e.message)
        setAttempts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttempts()
  }, [questionId])

  if (loading) {
    return (
      <div className="text-muted-foreground text-sm">Loading attempts…</div>
    )
  }

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>
  }

  if (attempts.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No attempts yet. Complete this question to see your progress.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Your Attempts</h3>
      <div className="space-y-2">
        {attempts.map((attempt) => {
          const scores = attempt.scores || {}
          const accuracy = scores.accuracy ?? scores.score ?? 0

          return (
            <div key={attempt.id} className="rounded-md border bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {attempt.question.difficulty || 'Medium'}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {new Date(attempt.createdAt).toLocaleString()}
                  </span>
                </div>
                {attempt.timeTaken && (
                  <span className="text-muted-foreground text-xs">
                    {attempt.timeTaken}s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-medium">Score:</span>{' '}
                  <span
                    className={`font-bold ${
                      accuracy >= 80
                        ? 'text-green-600'
                        : accuracy >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {Math.round(accuracy)}%
                  </span>
                </div>

                {scores.correctAnswers !== undefined &&
                  scores.totalAnswers !== undefined && (
                    <div>
                      <span className="text-muted-foreground">
                        {scores.correctAnswers}/{scores.totalAnswers} correct
                      </span>
                    </div>
                  )}

                {scores.wordCount !== undefined && (
                  <div>
                    <span className="text-muted-foreground">
                      {scores.wordCount} words
                    </span>
                  </div>
                )}
              </div>

              {/* Show user response summary */}
              <div className="text-muted-foreground mt-2 text-xs">
                {attempt.question.type === 'summarize_spoken_text' && (
                  <span>
                    Summary: {scores.wordCount || 0} words{' '}
                    {scores.withinRange ? '✓' : '(out of range)'}
                  </span>
                )}
                {attempt.question.type === 'write_from_dictation' && (
                  <span>
                    Dictation: {scores.wordCount || 0} words,{' '}
                    {scores.correctWords || 0}/{scores.totalWords || 0} correct
                  </span>
                )}
                {attempt.question.type === 'multiple_choice_single' && (
                  <span>Selected: {attempt.userResponse?.selectedOption}</span>
                )}
                {attempt.question.type === 'multiple_choice_multiple' && (
                  <span>
                    Selected{' '}
                    {attempt.userResponse?.selectedOptions?.length || 0} options
                  </span>
                )}
                {attempt.question.type === 'fill_in_blanks' && (
                  <span>
                    Filled{' '}
                    {Object.keys(attempt.userResponse?.answers || {}).length}{' '}
                    blanks
                  </span>
                )}
                {attempt.question.type === 'highlight_incorrect_words' && (
                  <span>
                    Highlighted {attempt.userResponse?.indices?.length || 0}{' '}
                    words
                  </span>
                )}
                {(attempt.question.type === 'highlight_correct_summary' ||
                  attempt.question.type === 'select_missing_word') && (
                  <span>Selected: {attempt.userResponse?.selectedOption}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
