'use client'

import { useState, useCallback } from 'react'
import { QuestionCard } from '@/components/speaking/question-card'
import { AudioRecorder } from '@/components/speaking/audio-recorder'
import { SpeakingResults } from '@/components/pte/speaking/SpeakingResults'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SPEAKING_TASKS as speakingTasks } from '@/lib/constants'
import { SpeakingScore } from '@/lib/types'

interface SpeakingTask {
  type: string;
  title: string;
  description: string;
  instructions: string;
  prepTime: number;
  recordTime: number; // Using recordTime instead of answerTime
  color: string;
}

interface SpeakingQuestionProps {
  question: any // Replace with proper speaking question type
  questionNumber: number
  totalQuestions: number
  onSubmit: (audioBlob: any) => void
  isScoring: boolean
  score: SpeakingScore | null
  onPrevious: () => void
  onNext: () => void
  questionId?: string
}

export function SpeakingQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  isScoring,
  score,
  onPrevious,
  onNext,
  questionId
}: SpeakingQuestionProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setAudioBlob(blob)
  }, [])

  // Find the task based on the question type
  const task = speakingTasks.find(t => t.type === question?.taskType) as SpeakingTask | undefined

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <QuestionCard
        task={task}
        question={question}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Audio Recorder */}
      <AudioRecorder
        prepTime={task?.prepTime || 35}
        recordTime={task?.recordTime || 40} // Using recordTime for compatibility
        onRecordingComplete={handleRecordingComplete}
        isScoring={isScoring}
      />

      {/* Navigation and Submit */}
      <div className="flex justify-between items-center pt-4">
        <Button
          onClick={onPrevious}
          disabled={questionNumber <= 1}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={() => audioBlob && onSubmit(audioBlob)}
          disabled={!audioBlob || isScoring}
          className="min-w-[120px]"
        >
          {isScoring ? 'Scoring...' : 'Submit'}
        </Button>

        <Button
          onClick={onNext}
          disabled={questionNumber >= totalQuestions}
          variant="outline"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Score Results */}
      {score && (
        <SpeakingResults
          score={score}
          questionType={question?.taskType || 'speaking'}
        />
      )}
    </div>
  )
}