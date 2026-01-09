'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
} from 'lucide-react'
import { AIFeedbackData, QuestionType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FeedbackCardProps {
  feedback: AIFeedbackData
  questionType?: string | QuestionType
  showCorrectAnswer?: boolean
  correctAnswer?: string | string[] | Record<string, string>
  userAnswer?: string | string[] | Record<string, string>
  onRetry?: () => void
  onClose?: () => void
}

interface ScoreItemProps {
  label: string
  score: number
  feedback?: string
  maxScore?: number
}

function ScoreItem({ label, score, feedback, maxScore = 90 }: ScoreItemProps) {
  const percentage = (score / maxScore) * 100
  const color = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'
  const bgColor = percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn('text-sm font-bold', color)}>{score}</span>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={bgColor} />
      {feedback && (
        <p className="text-xs text-muted-foreground mt-1">{feedback}</p>
      )}
    </div>
  )
}

function getScoreGrade(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30' }
  if (score >= 65) return { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-900/30' }
  if (score >= 50) return { label: 'Fair', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30' }
  return { label: 'Needs Work', color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30' }
}

export function FeedbackCard({
  feedback,
  questionType,
  showCorrectAnswer = false,
  correctAnswer,
  userAnswer,
  onRetry,
  onClose,
}: FeedbackCardProps) {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null)
  const grade = getScoreGrade(feedback.overallScore)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Collect all available score components
  const scoreComponents = [
    feedback.content && { label: 'Content', ...feedback.content },
    feedback.grammar && { label: 'Grammar', ...feedback.grammar },
    feedback.vocabulary && { label: 'Vocabulary', ...feedback.vocabulary },
    feedback.spelling && { label: 'Spelling', ...feedback.spelling },
    feedback.fluency && { label: 'Fluency', ...feedback.fluency },
    feedback.pronunciation && { label: 'Pronunciation', ...feedback.pronunciation },
    feedback.accuracy && { label: 'Accuracy', ...feedback.accuracy },
    feedback.structure && { label: 'Structure', ...feedback.structure },
  ].filter(Boolean) as { label: string; score: number; feedback: string }[]

  return (
    <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
      {/* Header with Overall Score */}
      <CardHeader className={cn('pb-4', grade.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-black/20 shadow-md">
              <span className="text-3xl font-black text-primary">{feedback.overallScore}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Your Score</CardTitle>
              <Badge variant="secondary" className={cn('mt-1 font-semibold', grade.color)}>
                {grade.label}
              </Badge>
            </div>
          </div>
          {questionType && (
            <Badge variant="outline" className="text-xs">
              {typeof questionType === 'string' ? questionType.replace(/_/g, ' ') : questionType}
            </Badge>
          )}
        </div>

        {/* Scoring Metrics Bar */}
        {feedback.scoringMetrics && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-xs text-muted-foreground">Lexical</div>
              <div className="font-bold text-sm">{feedback.scoringMetrics.lexicalScore}%</div>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-xs text-muted-foreground">Semantic</div>
              <div className="font-bold text-sm">{feedback.scoringMetrics.semanticScore}%</div>
            </div>
            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-xs text-muted-foreground">Fluency</div>
              <div className="font-bold text-sm">{feedback.scoringMetrics.fluencyScore}%</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Detailed Scores Grid */}
        {scoreComponents.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Detailed Scores
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scoreComponents.map((item) => (
                <ScoreItem
                  key={item.label}
                  label={item.label}
                  score={item.score}
                  feedback={item.feedback}
                />
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('strengths')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Strengths ({feedback.strengths.length})
              </h4>
              {expandedSection === 'strengths' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {(expandedSection === 'strengths' || feedback.strengths.length <= 3) && (
              <ul className="space-y-2">
                {feedback.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-green-800 dark:text-green-200">{strength}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('improvements')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Areas to Improve ({feedback.areasForImprovement.length})
              </h4>
              {expandedSection === 'improvements' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {(expandedSection === 'improvements' || feedback.areasForImprovement.length <= 3) && (
              <ul className="space-y-2">
                {feedback.areasForImprovement.map((area, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <span className="text-amber-800 dark:text-amber-200">{area}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Suggestions */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('suggestions')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Tips & Suggestions ({feedback.suggestions.length})
              </h4>
              {expandedSection === 'suggestions' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {(expandedSection === 'suggestions' || feedback.suggestions.length <= 3) && (
              <ul className="space-y-2">
                {feedback.suggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800"
                  >
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-blue-800 dark:text-blue-200">{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Correct Answer Comparison (for deterministic questions) */}
        {showCorrectAnswer && correctAnswer && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Answer Comparison
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                <div className="text-xs font-semibold text-red-600 mb-1">Your Answer</div>
                <div className="text-sm text-red-800 dark:text-red-200">
                  {typeof userAnswer === 'string'
                    ? userAnswer
                    : Array.isArray(userAnswer)
                    ? userAnswer.join(', ')
                    : JSON.stringify(userAnswer)}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="text-xs font-semibold text-green-600 mb-1">Correct Answer</div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  {typeof correctAnswer === 'string'
                    ? correctAnswer
                    : Array.isArray(correctAnswer)
                    ? correctAnswer.join(', ')
                    : JSON.stringify(correctAnswer)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FeedbackCard
