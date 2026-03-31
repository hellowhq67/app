'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Lock, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

const sections: QuestionSection[] = ['Speaking', 'Writing', 'Reading', 'Listening']
const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard']

export function QuestionsTable({ questions }: { questions: AdminQuestion[] }) {
  const [search, setSearch] = useState('')
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [premiumFilter, setPremiumFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase())
      const matchSection = sectionFilter === 'all' || q.section === sectionFilter
      const matchDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter
      const matchPremium =
        premiumFilter === 'all' ||
        (premiumFilter === 'premium' ? q.isPremium : !q.isPremium)
      return matchSearch && matchSection && matchDifficulty && matchPremium
    })
  }, [questions, search, sectionFilter, difficultyFilter, premiumFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={premiumFilter} onValueChange={setPremiumFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} question{filtered.length !== 1 && 's'}</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-64">Title</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Access</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Avg Score</TableHead>
              <TableHead className="text-right">Pass Rate</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No questions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((q) => (
                <TableRow key={q.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-sm text-foreground max-w-xs">
                    <span className="line-clamp-1">{q.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${sectionStyle[q.section]}`}>{q.section}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{q.questionType}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${difficultyStyle[q.difficulty]}`}>{q.difficulty}</Badge>
                  </TableCell>
                  <TableCell>
                    {q.isPremium
                      ? <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><Lock className="h-3 w-3" /> Premium</span>
                      : <span className="text-xs text-muted-foreground">Free</span>}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {q.totalAttempts.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">{q.avgScore}%</TableCell>
                  <TableCell className="text-right text-sm text-foreground">{q.passRate}%</TableCell>
                  <TableCell>
                    <Link href={`/admin/questions/${q.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
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
