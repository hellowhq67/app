'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

interface FeedbackCardProps {
  feedback: AIFeedbackData
  questionType: string | QuestionType
  onRetry?: () => void
  onClose?: () => void
}

export function FeedbackCard({ feedback, questionType }: FeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Score</span>
          <Badge variant="outline" className="text-lg px-4 py-1">
            <span className={getScoreColor(feedback.overallScore)}>
              {feedback.overallScore}/90
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div className="grid gap-4">
          {feedback.content && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Content</span>
              <span className={getScoreColor(feedback.content.score)}>
                {feedback.content.score}/90
              </span>
            </div>
          )}
          {feedback.pronunciation && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Pronunciation</span>
              <span className={getScoreColor(feedback.pronunciation.score)}>
                {feedback.pronunciation.score}/90
              </span>
            </div>
          )}
          {feedback.fluency && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Fluency</span>
              <span className={getScoreColor(feedback.fluency.score)}>
                {feedback.fluency.score}/90
              </span>
            </div>
          )}
          {feedback.grammar && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Grammar</span>
              <span className={getScoreColor(feedback.grammar.score)}>
                {feedback.grammar.score}/90
              </span>
            </div>
          )}
          {feedback.vocabulary && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Vocabulary</span>
              <span className={getScoreColor(feedback.vocabulary.score)}>
                {feedback.vocabulary.score}/90
              </span>
            </div>
          )}
          {feedback.spelling && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Spelling</span>
              <span className={getScoreColor(feedback.spelling.score)}>
                {feedback.spelling.score}/90
              </span>
            </div>
          )}
        </div>

        {/* Detailed Feedback */}
        <div className="space-y-4">
          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20">
              <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle className="h-4 w-4" /> Strengths
              </div>
              <ul className="space-y-1 text-sm text-green-800 dark:text-green-300">
                {feedback.strengths.map((strength, i) => (
                  <li key={i}>• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20">
              <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-medium">
                <AlertCircle className="h-4 w-4" /> Areas to Improve
              </div>
              <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-300">
                {feedback.areasForImprovement.map((area, i) => (
                  <li key={i}>• {area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20">
              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-medium">
                <Lightbulb className="h-4 w-4" /> Tips
              </div>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                {feedback.suggestions.map((suggestion, i) => (
                  <li key={i}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transcript if available */}
        {feedback.transcript && (
          <div className="p-4 rounded-lg bg-muted/30 border">
            <div className="font-medium mb-2">Transcript:</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.transcript}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
