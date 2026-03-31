import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { AdminAttempt } from '@/lib/admin/types'

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'
      : score >= 40
      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0'
      : 'bg-destructive/10 text-destructive border-0'
  return <Badge className={`text-xs ${cls}`}>{score}%</Badge>
}

const sectionColors: Record<string, string> = {
  Speaking: 'bg-primary/10 text-primary border-0',
  Writing: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0',
  Reading: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  Listening: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  return `${Math.round(seconds / 60)}m`
}

export function UserAttemptsTable({ attempts }: { attempts: AdminAttempt[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Practice History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {attempts.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">No attempts yet.</p>
        ) : (
          <div className="rounded-b-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Question</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm font-medium text-foreground max-w-48 truncate">
                      {a.questionTitle}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${sectionColors[a.section] ?? 'bg-muted text-muted-foreground border-0'}`}>
                        {a.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.questionType}</TableCell>
                    <TableCell><ScoreBadge score={a.score} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDuration(a.timeTaken)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
