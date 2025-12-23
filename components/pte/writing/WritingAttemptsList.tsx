'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Attempt = {
  id: string
  userResponse: string
  scores: {
    total?: number | null
    wordCount?: number | null
    sentenceCount?: number | null
    length?: {
      min: number
      max: number
      withinRange: boolean
    }
    metrics?: {
      uniqueWordRatio?: number
      charCount?: number
    }
    grammar?: number | null
    vocabulary?: number | null
    coherence?: number | null
    taskResponse?: number | null
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

function snippet(text: string, max = 140) {
  const t = String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

export default function WritingAttemptsList({ questionId }: Props) {
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

        const res = await fetch(`/api/writing/attempts?${params}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (res.status === 401) {
            setAttempts([])
            return
          }
          const msg =
            (await res.json().catch(() => null))?.error ||
            `Failed to load attempts (${res.status})`
          throw new Error(msg)
        }
        const data = await res.json()
        setAttempts(Array.isArray(data.items) ? data.items : [])
      } catch (e: any) {
        setError(e.message || 'Failed to load attempts.')
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
        No attempts yet. Write your response and submit to see your progress.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Your Attempts</h3>
      <div className="space-y-2">
        {attempts.map((attempt) => {
          const total = attempt.scores?.total ?? null
          const within = attempt.scores?.length?.withinRange ?? null
          const wc = attempt.scores?.wordCount ?? null

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
                <div className="flex items-center gap-2">
                  {typeof total === 'number' ? (
                    <Badge
                      variant="default"
                      className={`text-xs ${total >= 75 ? 'bg-green-600' : total >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      title="Heuristic total score (0–90)"
                    >
                      Total: {total}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Scored
                    </Badge>
                  )}
                  {wc !== null ? (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      title="Word count"
                    >
                      {wc} words
                    </Badge>
                  ) : null}
                  {within !== null ? (
                    <Badge
                      variant={within ? 'secondary' : 'destructive'}
                      className="text-xs"
                      title="Length within recommended range"
                    >
                      {within ? 'Within range' : 'Out of range'}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* User text preview */}
              <div className="text-muted-foreground text-xs whitespace-pre-wrap">
                {snippet(attempt.userResponse, 280)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
