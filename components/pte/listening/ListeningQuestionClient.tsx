'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import AudioPlayer from './AudioPlayer'
import ListeningInput from './ListeningInput'
import { AIScoringModal } from '@/components/pte/scoring/AIScoringModal'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { scoreListeningAttempt } from '@/app/actions/pte'
import ListeningScoreDisplay from './ListeningScoreDisplay' // Will create this component next
import { countWords } from '@/lib/utils'

type ListeningQuestionClientProps = {
  question: {
    id: string
    type:
      | QuestionType.SUMMARIZE_SPOKEN_TEXT
      | QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE
      | QuestionType.LISTENING_BLANKS
      | QuestionType.HIGHLIGHT_CORRECT_SUMMARY
      | QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE
      | QuestionType.SELECT_MISSING_WORD
      | QuestionType.HIGHLIGHT_INCORRECT_WORDS
      | QuestionType.WRITE_FROM_DICTATION
    title?: string | null
    promptText?: string | null
    promptMediaUrl?: string | null
    questionData?: {
      options?: string[]
      wordBank?: string[]
      transcript?: string // Audio transcript
      answerKey: any
    }
  }
}

export default function ListeningQuestionClient({
  question,
}: ListeningQuestionClientProps) {
  const [userResponse, setUserResponse] = useState<any>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackData | null>(null)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Ensure answerKey and transcript are available for relevant types
  const answerKey = question.questionData?.answerKey
  const audioTranscript = question.questionData?.transcript

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

  // Ensure audio transcript is available for audio-based questions
  const requiresAudioTranscript = [
    QuestionType.SUMMARIZE_SPOKEN_TEXT,
    QuestionType.WRITE_FROM_DICTATION,
    QuestionType.HIGHLIGHT_INCORRECT_WORDS,
  ].includes(question.type)

  if (requiresAudioTranscript && !audioTranscript) {
    console.error('Audio transcript is missing for question:', question.id)
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-md border p-4 text-sm text-red-600"
        >
          Error: Audio transcript not found for this question.
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

    if (!audioPlayed && question.promptMediaUrl) {
      setError('Please play the audio at least once before submitting.')
      return
    }

    setError(null)
    setIsScoring(true)
    setAiFeedback(null)

    try {
      const result = await scoreListeningAttempt(
        question.type,
        question.promptText,
        question.questionData?.options,
        question.questionData?.wordBank,
        audioTranscript, // Pass the original audio transcript
        answerKey,
        userResponse
      )

      if (result.success) {
        setAiFeedback(result.feedback!)
      } else {
        setError(result.error || 'Failed to get AI score.')
      }
    } catch (e) {
      console.error('Error scoring listening attempt:', e)
      setError('An unexpected error occurred while scoring.')
    } finally {
      setIsScoring(false)
    }
  }, [
    userResponse,
    audioPlayed,
    question.promptMediaUrl,
    question.type,
    question.promptText,
    question.questionData?.options,
    question.questionData?.wordBank,
    audioTranscript,
    answerKey,
  ])

  const handleReset = useCallback(() => {
    setUserResponse(null)
    setAiFeedback(null)
    setError(null)
    setIsScoring(false)
    setAudioPlayed(false)
    setStartTime(Date.now()) // Reset timer
  }, [])

  const handleAudioPlay = useCallback(() => {
    setAudioPlayed(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Question Title */}
      <div className="rounded-md border p-4">
        <h2 className="mb-2 text-lg font-semibold">{question.title}</h2>
        {question.promptText && (
          <div className="prose prose-sm text-muted-foreground max-w-none">
            <p>{question.promptText}</p>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {question.promptMediaUrl && (
        <AudioPlayer audioUrl={question.promptMediaUrl} onPlay={handleAudioPlay} />
      )}

      {/* Input Component */}
      <div className="space-y-3 rounded-md border p-4">
        <ListeningInput
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
            disabled={
              !userResponse ||
              isScoring ||
              (question.promptMediaUrl && !audioPlayed)
            }
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
            {error.toLowerCase().includes('play the audio') ? (
              <p className="text-xs text-amber-600">
                ⚠ You must play the audio at least once.
              </p>
            ) : null}
          </div>
        ) : null}

        {!audioPlayed && question.promptMediaUrl ? (
          <p className="text-xs text-amber-600">
            ⚠ Play the audio before submitting your answer.
          </p>
        ) : !userResponse && !aiFeedback ? (
          <p className="text-muted-foreground text-xs">
            Provide your answer, then click Submit to get AI scoring.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Ready to submit. Time elapsed:{' '}
            {Math.floor((Date.now() - startTime) / 1000)}s
          </p>
        )}
      </div>

      {/* AI Scoring Modal */}
      <AIScoringModal
        open={isScoring}
        onOpenChange={() => {}}
        isScoring={isScoring}
        title="AI Scoring Your Response"
        description="Analyzing listening comprehension and accuracy..."
      />

      {aiFeedback && <ListeningScoreDisplay scoreData={aiFeedback} />}
    </div>
  )
}