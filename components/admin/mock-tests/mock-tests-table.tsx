'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export function MockTestsTable({ tests }: { tests: AdminMockTest[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return tests.filter((t) => statusFilter === 'all' || t.status === statusFilter)
  }, [tests, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} test{filtered.length !== 1 && 's'}</span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Test Name</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No tests match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((test) => (
                <TableRow key={test.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm font-medium text-foreground max-w-48">
                    <span className="line-clamp-1">{test.testName}</span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${test.userId}`} className="text-sm text-foreground hover:text-primary transition-colors">
                      {test.userName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusStyle[test.status]}`}>
                      {statusLabel[test.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {test.overallScore !== null
                      ? <span className="text-sm font-medium text-foreground">{test.overallScore}</span>
                      : <span className="text-sm text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(test.completedQuestions / test.totalQuestions) * 100}
                        className="h-1.5 w-16"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {test.completedQuestions}/{test.totalQuestions}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDuration(test.totalDuration)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {test.startedAt
                      ? new Date(test.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/mock-tests/${test.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
