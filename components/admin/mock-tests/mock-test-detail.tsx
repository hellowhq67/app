import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { AdminMockTest, MockTestStatus } from '@/lib/admin/types'

const statusStyle: Record<MockTestStatus, string> = {
  not_started: 'bg-muted text-muted-foreground border-0',
  in_progress: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-0',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  expired: 'bg-destructive/10 text-destructive border-0',
}

const statusLabel: Record<MockTestStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  expired: 'Expired',
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

interface SectionScoreCardProps {
  section: string
  score: number | null
  color: string
}
function SectionScoreCard({ section, score, color }: SectionScoreCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{section}</p>
        <p className={`mt-1 text-2xl font-semibold ${score !== null ? color : 'text-muted-foreground'}`}>
          {score !== null ? score : '—'}
        </p>
        {score !== null && (
          <Progress value={score} className="mt-2 h-1.5" />
        )}
      </CardContent>
    </Card>
  )
}

export function MockTestDetail({ test }: { test: AdminMockTest }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{test.testName}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge className={`text-xs ${statusStyle[test.status]}`}>
                  {statusLabel[test.status]}
                </Badge>
                <Link href={`/admin/users/${test.userId}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {test.userName}
                </Link>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {test.startedAt && (
                  <span>Started: {new Date(test.startedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                )}
                {test.completedAt && (
                  <span>Completed: {new Date(test.completedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                )}
                <span>Duration: {formatDuration(test.totalDuration)}</span>
                <span>Progress: {test.completedQuestions}/{test.totalQuestions} questions</span>
              </div>
            </div>
            {test.overallScore !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Overall Score</p>
                <p className="text-4xl font-bold text-primary">{test.overallScore}</p>
                <p className="text-xs text-muted-foreground">out of 90</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Scores */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Section Scores</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SectionScoreCard section="Speaking" score={test.speakingScore} color="text-primary" />
          <SectionScoreCard section="Writing" score={test.writingScore} color="text-purple-600 dark:text-purple-400" />
          <SectionScoreCard section="Reading" score={test.readingScore} color="text-emerald-600 dark:text-emerald-400" />
          <SectionScoreCard section="Listening" score={test.listeningScore} color="text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      {/* Enabling Skills */}
      {test.enablingSkills && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enabling Skills</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {Object.entries({
              Grammar: test.enablingSkills.grammar,
              'Oral Fluency': test.enablingSkills.oralFluency,
              Pronunciation: test.enablingSkills.pronunciation,
              Spelling: test.enablingSkills.spelling,
              Vocabulary: test.enablingSkills.vocabulary,
              'Written Discourse': test.enablingSkills.writtenDiscourse,
            }).map(([skill, score]) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{skill}</span>
                  <span className="text-xs font-medium text-foreground">{score}</span>
                </div>
                <Progress value={score} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
