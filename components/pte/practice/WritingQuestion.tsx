'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SpeakingResults } from '@/components/pte/speaking/SpeakingResults'
import { SpeakingScore } from '@/lib/types'

interface WritingQuestionProps {
  question: any // Replace with proper writing question type
  questionNumber: number
  totalQuestions: number
  onSubmit: (answer: string) => void
  isScoring: boolean
  score: SpeakingScore | null
  onPrevious: () => void
  onNext: () => void
  questionId?: string
}

export function WritingQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  isScoring,
  score,
  onPrevious,
  onNext,
  questionId
}: WritingQuestionProps) {
  const [answer, setAnswer] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setAnswer(text)
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length)
  }

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer)
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Prompt:</h3>
            <p className="text-gray-700">
              {question?.promptText || question?.question || 'No question text available'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium">Your Response</label>
              <span className="text-sm text-muted-foreground">
                Word count: {wordCount}
              </span>
            </div>
            <Textarea
              placeholder="Type your response here..."
              className="min-h-[200px]"
              value={answer}
              onChange={handleAnswerChange}
            />
          </div>
        </CardContent>
      </Card>

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
          onClick={handleSubmit}
          disabled={!answer.trim() || isScoring}
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
          questionType={question?.type || 'writing'}
        />
      )}
    </div>
  )
}