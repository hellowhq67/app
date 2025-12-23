'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ListeningQuestionType } from '@/app/api/listening/schemas'
import AttemptController from '@/components/pte/attempt/AttemptController'
import AudioPlayer from '@/components/pte/listening/AudioPlayer'
import ListeningInput from '@/components/pte/listening/ListeningInput'
import { Button } from '@/components/ui/button'
import {
  enqueueSubmission,
  initQueueAutoRetry,
  submitListeningAttempt,
  type StartSessionResponse,
} from '@/lib/pte/attempts'

type PromptLike = {
  id: string
  type: ListeningQuestionType
  title?: string | null
  promptText?: string | null
  promptMediaUrl?: string | null
  options?: any
  transcript?: string | null
  difficulty?: string | null
}

type Props = {
  questionId: string
  questionType: ListeningQuestionType
  prompt?: PromptLike | null
  className?: string
  onSubmitted?: (attemptId?: string) => void
  // Optional per-item timer (ms). If not provided:
  // - summarize_spoken_text defaults to 10m (official)
  // - others default to 2m for practice (section tests should use SectionTimer at higher level)
  answerMs?: number
  // Whether to allow audio replay in practice.
  // PTE rules vary by item; enforcement requires player-level locking.
  // Current player component doesn't support enforced lock, so this acts as UX hint only.
  allowReplayHint?: boolean
}

/**
 * ListeningAttempt
 * - Item-level listening attempt with authentic timing options
 * - summarize_spoken_text defaults to 10 minutes; others default to 2 minutes for practice
 * - Requires audio to be played at least once before submission
 * - Auto-submits on time expiry
 * - Offline queue and retry support
 */
export default function ListeningAttempt({
  questionId,
  questionType,
  prompt: initialPrompt,
  className,
  onSubmitted,
  answerMs,
  allowReplayHint = true,
}: Props) {
  const [prompt, setPrompt] = useState<PromptLike | null>(initialPrompt || null)
  const [loading, setLoading] = useState<boolean>(!initialPrompt)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [userResponse, setUserResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [lastAttemptId, setLastAttemptId] = useState<string | undefined>(
    undefined
  )

  // Default timers by type (practice defaults)
  const timers = useMemo(() => {
    if (answerMs && Number.isFinite(answerMs)) {
      return { answerMs: Math.max(1_000, Math.floor(answerMs)) }
    }
    if (questionType === 'summarize_spoken_text') {
      return { answerMs: 10 * 60_000 }
    }
    // Practice per-item default for other listening types
    return { answerMs: 2 * 60_000 }
  }, [answerMs, questionType])

  // Fetch prompt if not provided
  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (initialPrompt) return
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch(
          `/api/listening/questions/${encodeURIComponent(questionId)}`,
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

  // Ensure offline auto-retry is enabled
  useEffect(() => {
    initQueueAutoRetry()
  }, [])

  const onResponseChange = useCallback((resp: any) => {
    setError(null)
    setUserResponse(resp)
  }, [])

  const onAudioPlay = useCallback(() => {
    setAudioPlayed(true)
    setPlayCount((c) => c + 1)
  }, [])

  const doSubmit = useCallback(
    async (ctx: {
      token: string
      session: StartSessionResponse
      phase: 'auto-expire' | 'user-submit'
    }) => {
      // Require at least one audio play for submission
      if (!audioPlayed) {
        setError('Please play the audio at least once before submitting.')
        return
      }
      if (!userResponse) {
        setError('Please provide an answer before submitting.')
        return
      }

      try {
        const timeTakenSec = Math.floor(
          (Date.now() - ctx.session.startAt) / 1000
        )

        const res = await submitListeningAttempt({
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
          // Enqueue for retry
          enqueueSubmission({
            url: '/api/listening/attempts',
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
        // Network error -> enqueue and show info
        enqueueSubmission({
          url: '/api/listening/attempts',
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
    [audioPlayed, onSubmitted, questionId, questionType, userResponse]
  )

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
      {/* Prompt */}
      <div className="mb-4 rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{prompt.title}</h2>
        {prompt.promptText ? (
          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>{prompt.promptText}</p>
          </div>
        ) : null}
      </div>

      {/* Attempt with timers */}
      <AttemptController
        section="listening"
        questionType={questionType}
        questionId={questionId}
        duration={{ answerMs: timers.answerMs }}
        onSubmit={doSubmit}
        onPhaseChange={(p) => {
          if (typeof window !== 'undefined') {
            console.log('[ListeningAttempt] phase=', p)
          }
        }}
      >
        {(ctx) => (
          <div className="space-y-3 rounded-md border p-4">
            {/* Audio Player */}
            {prompt.promptMediaUrl ? (
              <AudioPlayer
                audioUrl={prompt.promptMediaUrl}
                onPlay={onAudioPlay}
              />
            ) : null}

            {/* Input */}
            <ListeningInput
              questionType={questionType}
              question={prompt as any}
              value={userResponse}
              onChange={onResponseChange}
            />

            <div className="flex items-center gap-2">
              <Button
                aria-label="Submit attempt"
                onClick={ctx.controls.submit}
                disabled={
                  ctx.phase !== 'answering' || !userResponse || !audioPlayed
                }
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
            ) : !audioPlayed ? (
              <p className="text-xs text-amber-600">
                Play the audio before submitting your answer.
              </p>
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

            {allowReplayHint ? (
              <p className="text-muted-foreground text-[11px]">
                Audio plays: {playCount}. In real test conditions, replay may be
                restricted.
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
