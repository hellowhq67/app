'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AttemptController from '@/components/pte/attempt/AttemptController'
import ReadingInput from '@/components/pte/reading/ReadingInput'
import { Button } from '@/components/ui/button'
import {
  enqueueSubmission,
  initQueueAutoRetry,
  submitReadingAttempt,
  type StartSessionResponse,
} from '@/lib/pte/attempts'

type ReadingType =
  | 'multiple_choice_single'
  | 'multiple_choice_multiple'
  | 'reorder_paragraphs'
  | 'fill_in_blanks'
  | 'reading_writing_fill_blanks'

type PromptLike = {
  id: string
  type: ReadingType
  title?: string | null
  promptText?: string | null
  options?: any
  difficulty?: string | null
}

type Props = {
  questionId: string
  questionType: ReadingType
  // If prompt is provided, component renders immediately; otherwise it will fetch.
  prompt?: PromptLike | null
  className?: string
  onSubmitted?: (attemptId?: string) => void
  // Optional per-item timer (ms). If not provided, defaults to 5 minutes for item practice.
  // Note: Section tests should use SectionTimer and not rely on this.
  answerMs?: number
}

/**
 * ReadingAttempt
 * - Item-level attempt wrapper with auto-submit on expiry
 * - For section tests, prefer using SectionTimer in a higher-level page
 * - Handles offline queue for retries on network failures
 * - Accessible and keyboard operable via AttemptController
 */
export default function ReadingAttempt({
  questionId,
  questionType,
  prompt: initialPrompt,
  className,
  onSubmitted,
  answerMs = 5 * 60_000, // 5m default for per-item practice
}: Props) {
  const [prompt, setPrompt] = useState<PromptLike | null>(initialPrompt || null)
  const [loading, setLoading] = useState<boolean>(!initialPrompt)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [userResponse, setUserResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastAttemptId, setLastAttemptId] = useState<string | undefined>(
    undefined
  )

  // Fetch question if not provided
  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (initialPrompt) return
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch(
          `/api/reading/questions/${encodeURIComponent(questionId)}`,
          { cache: 'no-store' }
        )
        if (!res.ok) {
          const msg =
            (await res.json().catch(() => null))?.error ||
            `Failed to load question (${res.status})`
          throw new Error(msg)
        }
        const data = await res.json()
        const q = (data?.question || data) as PromptLike
        if (mounted) setPrompt(q)
      } catch (e: any) {
        if (mounted) setFetchError(e?.message || 'Failed to load question.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [initialPrompt, questionId])

  // Init offline retry once
  useEffect(() => {
    initQueueAutoRetry()
  }, [])

  const doSubmit = useCallback(
    async (ctx: {
      token: string
      session: StartSessionResponse
      phase: 'auto-expire' | 'user-submit'
    }) => {
      if (!userResponse) {
        setError('Please provide an answer before submitting.')
        return
      }

      try {
        const timeTakenSec = Math.floor(
          (Date.now() - ctx.session.startAt) / 1000
        )

        const res = await submitReadingAttempt({
          token: ctx.token,
          questionId,
          type: questionType,
          userResponse,
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
          enqueueSubmission({
            url: '/api/reading/attempts',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-session-token': ctx.token,
            },
            body: {
              questionId,
              type: questionType,
              userResponse,
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
        enqueueSubmission({
          url: '/api/reading/attempts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': ctx.token,
          },
          body: {
            questionId,
            type: questionType,
            userResponse,
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
    [onSubmitted, questionId, questionType, userResponse]
  )

  const onResponseChange = useCallback((resp: any) => {
    setError(null)
    setUserResponse(resp)
  }, [])

  if (loading) {
    return (
      <div className="text-muted-foreground rounded-md border p-4 text-sm">
        Loading question…
      </div>
    )
  }
  if (fetchError) {
    return (
      <div className="rounded-md border p-4 text-sm text-red-600" role="alert">
        {fetchError}
      </div>
    )
  }
  if (!prompt) {
    return (
      <div className="rounded-md border p-4 text-sm">Question unavailable.</div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-4 rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{prompt.title}</h2>
        <div className="prose prose-sm text-muted-foreground max-w-none">
          <p>{prompt.promptText}</p>
        </div>
      </div>

      <AttemptController
        section="reading"
        questionType={questionType}
        questionId={questionId}
        duration={{ answerMs }} // item-level practice timer
        onSubmit={doSubmit}
        onPhaseChange={(p) => {
          if (typeof window !== 'undefined') {
            console.log('[ReadingAttempt] phase=', p)
          }
        }}
      >
        {(ctx) => (
          <div className="space-y-3 rounded-md border p-4">
            <ReadingInput
              questionType={questionType}
              question={prompt as any}
              value={userResponse}
              onChange={onResponseChange}
            />

            <div className="flex items-center gap-2">
              <Button
                aria-label="Submit attempt"
                onClick={ctx.controls.submit}
                disabled={ctx.phase !== 'answering' || !userResponse}
              >
                Submit
              </Button>
              <a
                aria-label="Help for this task"
                href="/pte/ai-coach"
                className="text-sm underline"
              >
                Help
              </a>
            </div>

            {error ? (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            ) : !userResponse ? (
              <p className="text-muted-foreground text-xs">
                Provide your answer. Submission will auto-send at time expiry.
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">Ready to submit.</p>
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
