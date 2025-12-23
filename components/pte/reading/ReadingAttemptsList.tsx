'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Attempt = {
  id: string
  userResponse: any
  scores: {
    accuracy: number
    correctAnswers: number
    totalAnswers: number
  } | null
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

export default function ReadingAttemptsList({ questionId }: Props) {
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

        const res = await fetch(`/api/reading/attempts?${params}`)
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
        {attempts.map((attempt) => (
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

            {attempt.scores && (
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-medium">Accuracy:</span>{' '}
                  <span
                    className={`font-bold ${
                      attempt.scores.accuracy >= 80
                        ? 'text-green-600'
                        : attempt.scores.accuracy >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {attempt.scores.accuracy}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {attempt.scores.correctAnswers}/
                    {attempt.scores.totalAnswers} correct
                  </span>
                </div>
              </div>
            )}

            {/* Show user response summary */}
            <div className="text-muted-foreground mt-2 text-xs">
              {attempt.question.type === 'multiple_choice_single' && (
                <span>Selected: {attempt.userResponse?.selectedOption}</span>
              )}
              {attempt.question.type === 'multiple_choice_multiple' && (
                <span>
                  Selected {attempt.userResponse?.selectedOptions?.length || 0}{' '}
                  options
                </span>
              )}
              {attempt.question.type === 'reorder_paragraphs' && (
                <span>
                  Reordered {attempt.userResponse?.order?.length || 0}{' '}
                  paragraphs
                </span>
              )}
              {(attempt.question.type === 'fill_in_blanks' ||
                attempt.question.type === 'reading_writing_fill_blanks') && (
                <span>
                  Filled{' '}
                  {Object.keys(attempt.userResponse?.answers || {}).length}{' '}
                  blanks
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
