'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AIFeedbackData } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

type ScorePillProps = {
  label: string
  score?: number
  feedback?: string
}

const ScorePill = ({ label, score, feedback }: ScorePillProps) => {
  if (score === undefined || feedback === undefined) return null

  const getPillColor = () => {
    if (score >= 1.5) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <h4 className="font-semibold">{label}</h4>
        <Badge className={getPillColor()}>{score} / 2</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{feedback}</p>
    </div>
  )
}

const ScorePillContent = ({
  score,
  feedback,
}: {
  score?: number
  feedback?: string
}) => {
  if (score === undefined || feedback === undefined) return null

  const getPillColor = () => {
    if (score >= 2.5) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 1.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <Badge className={getPillColor()}>{score} / 3</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{feedback}</p>
    </div>
  )
}

export default function AiScoreDisplay({
  scoreData,
}: {
  scoreData: AIFeedbackData
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          Here's the AI-powered feedback on your performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center rounded-lg bg-muted p-6">
          <p className="text-lg font-semibold text-muted-foreground">
            Overall Score
          </p>
          <p className="text-6xl font-bold tracking-tight">
            {Math.round(scoreData.overallScore)}
            <span className="text-3xl text-muted-foreground">/90</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Detailed Score Breakdown */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Score Breakdown</h3>
            <ScorePillContent
              score={scoreData.content?.score}
              feedback={scoreData.content?.feedback}
            />
            <ScorePill label="Grammar" {...scoreData.grammar} />
            <ScorePill label="Vocabulary" {...scoreData.vocabulary} />
            <ScorePill label="Spelling" {...scoreData.spelling} />
          </div>

          {/* Strengths and Improvements */}
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-green-600">Strengths</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {scoreData.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold text-red-600">
                Areas for Improvement
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {scoreData.areasForImprovement.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}