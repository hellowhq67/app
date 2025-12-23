'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SpeakingResults } from '@/components/pte/speaking/SpeakingResults'
import { SpeakingScore } from '@/lib/types'

interface ReadingQuestionProps {
  question: any // Replace with proper reading question type
  questionNumber: number
  totalQuestions: number
  onSubmit: (answer: any) => void
  isScoring: boolean
  score: SpeakingScore | null
  onPrevious: () => void
  onNext: () => void
  questionId?: string
}

export function ReadingQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  isScoring,
  score,
  onPrevious,
  onNext,
  questionId
}: ReadingQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onSubmit(selectedOption)
    }
  }

  // Get options from question data
  const options = question?.options || []

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
            <h3 className="font-semibold mb-2">Question:</h3>
            <p className="text-gray-700">
              {question?.promptText || question?.question || 'No question text available'}
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg mt-4">
            <h3 className="font-semibold mb-2">Passage:</h3>
            <p className="text-gray-700 leading-relaxed">
              {question?.passage || "No passage available for this reading question. In a real implementation, the reading passage would appear here."}
            </p>
          </div>

          {/* Options for Multiple Choice or other formats */}
          <div className="mt-6 space-y-3">
            <RadioGroup value={selectedOption || undefined} onValueChange={setSelectedOption}>
              {options.map((option: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <RadioGroupItem value={typeof option === 'string' ? option : option.id || option.value || index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-base font-normal flex-1">
                    {typeof option === 'string' ? option : option.text || option.label || option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
          disabled={selectedOption === null || isScoring}
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
          questionType={question?.type || 'reading'}
        />
      )}
    </div>
  )
}