import { Lock, Unlock, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AdminQuestion, QuestionSection, Difficulty } from '@/lib/admin/types'

const sectionStyle: Record<QuestionSection, string> = {
  Speaking: 'bg-primary/10 text-primary border-0',
  Writing: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0',
  Reading: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  Listening: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
}

const difficultyStyle: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
  Hard: 'bg-destructive/10 text-destructive border-0',
}

interface StatTileProps { label: string; value: string; icon: React.ReactNode }
function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuestionDetail({ question }: { question: AdminQuestion }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">{question.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={`text-xs ${sectionStyle[question.section]}`}>{question.section}</Badge>
                <Badge className={`text-xs ${difficultyStyle[question.difficulty]}`}>{question.difficulty}</Badge>
                <span className="text-xs text-muted-foreground">{question.questionType}</span>
                {question.isPremium
                  ? <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><Lock className="h-3 w-3" /> Premium</span>
                  : <span className="flex items-center gap-1 text-xs text-muted-foreground"><Unlock className="h-3 w-3" /> Free</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {new Date(question.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Total Attempts" value={question.totalAttempts.toLocaleString()} icon={<Users className="h-4 w-4" />} />
        <StatTile label="Avg Score" value={`${question.avgScore}%`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatTile label="Pass Rate" value={`${question.passRate}%`} icon={<CheckCircle className="h-4 w-4" />} />
      </div>

      {/* Content Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Question Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{question.content}</p>
        </CardContent>
      </Card>
    </div>
  )
}
