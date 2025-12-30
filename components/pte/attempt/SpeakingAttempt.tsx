'use client'
import React, { useCallback, useMemo, useState } from 'react'
import AttemptController from '@/components/pte/attempt/AttemptController'
import QuestionPrompt from '@/components/pte/speaking/QuestionPrompt'
import SpeakingRecorder from '@/components/pte/speaking/SpeakingRecorder'
import { ScoreDetailsModal } from '@/components/pte/attempt/ScoreDetailsModal'
import { Button } from '@/components/ui/button'
import { scoreSpeakingAttempt, scoreReadAloudAttempt } from '@/app/actions/pte'
import { uploadAudioWithFallback } from '@/lib/pte/blob-upload'
import type { SpeakingTimings, SpeakingType } from '@/lib/pte/types'
import SpeakingBoards from '@/components/pte/speaking/SpeakingBoards'
import { QuestionType } from '@/lib/types'

type PromptLike = {
  title?: string | null
  promptText?: string | null
  promptMediaUrl?: string | null
  difficulty?: string | null
}
type Props = {
  questionId: string
  questionType: SpeakingType
  prompt?: PromptLike | null
  onSubmitted?: (attemptId?: string) => void
  className?: string
}
export default function SpeakingAttempt({
  questionId,
  questionType,
  prompt,
  onSubmitted,
  className,
}: Props) {
  // Resolve default timers for this speaking type (prep + answer)
  const timers = useMemo(() => {
    const t = getDefaultTimings('speaking', questionType)
    return {
      prepMs: t.prepMs || 0,
      answerMs: t.answerMs || 40_000,
    }
  }, [questionType])
  const [recorded, setRecorded] = useState<{
    blob: Blob
    durationMs: number
    timings: SpeakingTimings
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastAttemptId, setLastAttemptId] = useState<string | undefined>(
    undefined
  )
  // Score modal state
  const [scoreData, setScoreData] = useState<any>(null)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined)
  // Ensure offline queue auto-retry is initialized once on first mount
  React.useEffect(() => {
    initQueueAutoRetry()
  }, [])
  const handleRecorded = useCallback(
    (data: { blob: Blob; durationMs: number; timings: SpeakingTimings }) => {
      setError(null)
      setRecorded(data)
    },
    []
  )
  const doSubmit = useCallback(
    async (ctx: {
      token: string
      session: StartSessionResponse
      phase: 'auto-expire' | 'user-submit'
    }) => {
      if (!recorded) {
        // If no recording captured (edge case), surface a clear error. We still let AttemptController handle phase.
        setError(
          'No recording captured. Please ensure microphone permission is granted.'
        )
        // Enqueue a placeholder? API requires audioUrl, so we cannot submit without audio.
        // We exit early; AttemptController will show done/error state accordingly.
        return
      }
      try {
        // Wrap blob into File for upload
        const file = new File(
          [recorded.blob],
          `speaking-${questionType}-${questionId}.webm`,
          {
            type: 'audio/webm;codecs=opus',
          }
        )

        let result;
        const promptContent = prompt?.promptText || prompt?.title || '';

        // Call server action based on type
        if (questionType === 'read_aloud') {
             result = await scoreReadAloudAttempt(file, promptContent, questionId);
        } else {
             // Map string type to enum if necessary, or pass as is if compatible
             // Assuming QuestionType enum values match strings like 'describe_image' etc.
             // Need to ensure QuestionType enum is imported or compatible.
             // Using 'as any' for safety if enum mapping is tricky here without full type context.
             result = await scoreSpeakingAttempt(questionType as any, file, promptContent, questionId);
        }

        if (!result.success) {
            throw new Error(result.error || 'Submission failed');
        }

        // Success path
        setAudioUrl(result.audioUrl)
        setLastAttemptId(result.attemptId)
        
        if (result.feedback) {
          setScoreData({
            total: result.feedback.overallScore,
            content: result.feedback.content?.score,
            pronunciation: result.feedback.pronunciation?.score,
            fluency: result.feedback.fluency?.score,
            feedback: {
                rationale: result.feedback.suggestions?.join('\n')
            }
          })
          setShowScoreModal(true)
        }

        onSubmitted?.(result.attemptId)
        return
      } catch (e: any) {
        // Server action error -> surface error
        setError(
          e?.message || 'Submission failed. Please try again.'
        )
      }
    },
    [onSubmitted, questionId, questionType, recorded, prompt]
  )

  return (
    <div className={className}>
      {/* Prompt (title, text, and/or audio if provided) */}
      {prompt ? (
        <div className="mb-4 rounded-md border p-4">
          <QuestionPrompt
            question={
              {
                id: questionId,
                type: questionType,
                title: prompt.title ?? undefined,
                promptText: prompt.promptText ?? undefined,
                promptMediaUrl: prompt.promptMediaUrl ?? undefined,
                difficulty: prompt.difficulty ?? undefined,
              } as any
            }
          />
        </div>
      ) : null}

      {/* Attempt controller with recorder */}
      <AttemptController
        section="speaking"
        questionType={questionType}
        questionId={questionId}
        duration={{ prepMs: timers.prepMs, answerMs: timers.answerMs }}
        onSubmit={doSubmit}
        onPhaseChange={(p) => {
          // Telemetry hook
          if (typeof window !== 'undefined') {
            console.log('[SpeakingAttempt] phase=', p)
          }
        }}
      >
        {(ctx) => (
          <div className="space-y-3 rounded-md border p-4">
            <SpeakingRecorder
              type={questionType}
              timers={{ prepMs: timers.prepMs, recordMs: timers.answerMs }}
              onRecorded={handleRecorded}
              auto={{ active: ctx.phase === 'answering' }}
              onStateChange={(s) => {
                // Light telemetry
                if (typeof window !== 'undefined') {
                  console.log('[SpeakingRecorder] state=', s)
                }
              }}
            />

            {/* Submission actions (explicit submit enabled during answering) */}
            <div className="flex items-center gap-2">
              <Button
                aria-label="Submit attempt"
                onClick={ctx.controls.submit}
                disabled={ctx.phase !== 'answering' || !recorded}
              >
                Submit
              </Button>
            </div>

            {error ? (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            ) : recorded ? (
              <p className="text-muted-foreground text-xs">
                Ready to submit. Duration:{' '}
                {Math.round((recorded.durationMs || 0) / 1000)}s
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Recorder will auto-start during the answering phase.
              </p>
            )}

            {lastAttemptId ? (
              <div className="flex items-center gap-4">
                <p className="text-xs text-emerald-600">
                  Attempt submitted.
                </p>
                {scoreData && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowScoreModal(true)}
                  >
                    View Score
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </AttemptController>

      {/* Score Details Modal */}
      {scoreData && (
        <ScoreDetailsModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          score={{
            content: scoreData.content || 0,
            pronunciation: scoreData.pronunciation || 0,
            fluency: scoreData.fluency || 0,
            total: scoreData.total || 0
          }}
          feedback={{
            transcript: scoreData.feedback?.transcript || scoreData.meta?.transcript,
            suggestion: scoreData.feedback?.rationale
          }}
          audioUrl={audioUrl}
        />
      )}

      {/* Boards: Discussion | Board | Me */}
      <div className="mt-6">
        <SpeakingBoards questionId={questionId} questionType={questionType} />
      </div>
    </div>
  )
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
