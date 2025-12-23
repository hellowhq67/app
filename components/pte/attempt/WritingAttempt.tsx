'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AttemptController from '@/components/pte/attempt/AttemptController'
import WritingInput from '@/components/pte/writing/WritingInput'
import { Button } from '@/components/ui/button'
import {
  enqueueSubmission,
  getDefaultTimings,
  initQueueAutoRetry,
  submitWritingAttempt,
  type StartSessionResponse,
} from '@/lib/pte/attempts'

type WritingType = 'summarize_written_text' | 'write_essay'

type PromptLike = {
  title?: string | null
  promptText?: string | null
  difficulty?: string | null
}

type Props = {
  questionId: string
  questionType: WritingType
  prompt?: PromptLike | null
  className?: string
  onSubmitted?: (attemptId?: string) => void
}

/**
 * WritingAttempt
 * - Enforces authentic PTE timers (10m SWT, 20m Essay)
 * - Auto-submits on expiry with captured text
 * - Offline-queue retries on network failures
 * - Accessible controls with SR announcements via AttemptController
 */
export default function WritingAttempt({
  questionId,
  questionType,
  prompt,
  className,
  onSubmitted,
}: Props) {
  // Resolve default timing for this writing type
  const timers = useMemo(() => {
    const t = getDefaultTimings('writing', questionType)
    return {
      answerMs:
        t.answerMs ||
        (questionType === 'summarize_written_text' ? 10 * 60_000 : 20 * 60_000),
    }
  }, [questionType])

  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastAttemptId, setLastAttemptId] = useState<string | undefined>(
    undefined
  )

  // Local draft persistence
  useEffect(() => {
    const key = `pte-wr-draft:${questionType}:${questionId}`
    try {
      const saved = localStorage.getItem(key)
      if (saved) setText(saved)
    } catch {}
  }, [questionId, questionType])

  useEffect(() => {
    const key = `pte-wr-draft:${questionType}:${questionId}`
    const id = window.setTimeout(() => {
      try {
        if (text && text.trim().length > 0) {
          localStorage.setItem(key, text)
        } else {
          localStorage.removeItem(key)
        }
      } catch {}
    }, 400)
    return () => window.clearTimeout(id)
  }, [questionId, questionType, text])

  // Ensure offline queue retry is enabled
  useEffect(() => {
    initQueueAutoRetry()
  }, [])

  const doSubmit = useCallback(
    async (ctx: {
      token: string
      session: StartSessionResponse
      phase: 'auto-expire' | 'user-submit'
    }) => {
      if (!text || text.trim().length === 0) {
        // No text - submit empty? Better to reject and let user know.
        setError('Please write your response before submitting.')
        return
      }

      try {
        // timeTaken in seconds (approximate)
        const timeTakenSec = Math.floor(
          (Date.now() - ctx.session.startAt) / 1000
        )

        const res = await submitWritingAttempt({
          token: ctx.token,
          questionId,
          type: questionType,
          textAnswer: text,
          timeTaken: timeTakenSec,
          timings: {
            startAt: new Date(ctx.session.startAt).toISOString(),
            endAt: new Date(ctx.session.endAt).toISOString(),
          } as any,
        })

        if (res.ok) {
          const json = await res.json().catch(() => null)
          const attemptId: string | undefined = json?.attempt?.id
          setLastAttemptId(attemptId)
          onSubmitted?.(attemptId)
          return
        }

        const msg = await parseMsg(res)
        if (res.status >= 500) {
          // Enqueue retry
          enqueueSubmission({
            url: '/api/writing/attempts',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-session-token': ctx.token,
            },
            body: {
              questionId,
              type: questionType,
              textAnswer: text,
              timeTaken: timeTakenSec,
              timings: {
                startAt: new Date(ctx.session.startAt).toISOString(),
                endAt: new Date(ctx.session.endAt).toISOString(),
              },
            },
          })
        } else {
          setError(msg || 'Submission failed.')
        }
      } catch (e: any) {
        // Network error -> enqueue and inform user
        enqueueSubmission({
          url: '/api/writing/attempts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': ctx.token,
          },
          body: {
            questionId,
            type: questionType,
            textAnswer: text,
            timeTaken: Math.floor((Date.now() - ctx.session.startAt) / 1000),
            timings: {
              startAt: new Date(ctx.session.startAt).toISOString(),
              endAt: new Date(ctx.session.endAt).toISOString(),
            },
          },
        })
        setError(
          e?.message || 'Submission failed. We will retry when back online.'
        )
      }
    },
    [onSubmitted, questionId, questionType, text]
  )

  return (
    <div className={className}>
      {/* Prompt */}
      {prompt ? (
        <div className="mb-4 rounded-md border p-4">
          <h2 className="mb-2 text-lg font-semibold">{prompt.title}</h2>
          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>{prompt.promptText}</p>
          </div>
        </div>
      ) : null}

      <AttemptController
        section="writing"
        questionType={questionType}
        questionId={questionId}
        duration={{ answerMs: timers.answerMs }}
        onSubmit={doSubmit}
        onPhaseChange={(p) => {
          if (typeof window !== 'undefined') {
            console.log('[WritingAttempt] phase=', p)
          }
        }}
      >
        {(ctx) => (
          <div className="space-y-3 rounded-md border p-4">
            <WritingInput
              questionType={questionType}
              value={text}
              onChange={setText}
              disabled={ctx.phase !== 'answering'}
            />

            <div className="flex items-center gap-2">
              <Button
                aria-label="Submit attempt"
                onClick={ctx.controls.submit}
                disabled={ctx.phase !== 'answering' || !text}
              >
                Submit
              </Button>
              <Button
                aria-label="Clear draft"
                variant="outline"
                disabled={ctx.phase === 'submitting'}
                onClick={() => setText('')}
              >
                Clear
              </Button>
            </div>

            {error ? (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            ) : text ? (
              <p className="text-muted-foreground text-xs">
                Ready to submit. Your text has autosaved locally. Submissions
                auto-send when time is up.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Begin typing when answering starts. Time will auto-submit.
              </p>
            )}

            {lastAttemptId ? (
              <p className="text-xs text-emerald-600">
                Attempt submitted. ID: {lastAttemptId}
              </p>
            ) : null}
          </div>
        )}
      </AttemptController>
    </div>
  )
}

async function parseMsg(res: Response): Promise<string | null> {
  try {
    const json = await res.clone().json()
    return (json?.error as string) || null
  } catch {
    try {
      const t = await res.text()
      return tryParseError(t) || null
    } catch {
      return null
    }
  }
}

function tryParseError(t: string | null | undefined): string | null {
  if (!t) return null
  try {
    const j = JSON.parse(t)
    return (j?.error as string) || null
  } catch {
    return null
  }
}
