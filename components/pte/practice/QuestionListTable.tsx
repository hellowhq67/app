'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock } from 'lucide-react'
import { PracticeQuestion } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface QuestionTypeInfo {
  name: string
  description: string | null
  timeLimit?: number | null
}

interface QuestionListTableProps {
  questionType: QuestionTypeInfo
  questions: PracticeQuestion[]
  basePath: string
  backLink: string
  title: string
}

export default function QuestionListTable({
  questionType,
  questions,
  basePath,
  backLink,
  title,
}: QuestionListTableProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href={backLink}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {title}
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {questionType.name}
          </h1>
          <p className="text-muted-foreground">{questionType.description}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg w-fit">
        <span>{questions.length} Questions</span>
        <span>•</span>
        <span>
          Time:{' '}
          {questionType.timeLimit
            ? `${Math.floor(questionType.timeLimit / 60)} min`
            : 'N/A'}
        </span>
      </div>

      {/* Questions Table */}
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            No questions available for this type yet.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 min-w-[40px]">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="hidden sm:table-cell w-[120px]">Difficulty</TableHead>
                <TableHead className="hidden md:table-cell w-[120px]">Status</TableHead>
                <TableHead className="w-[80px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q, index) => (
                <TableRow key={q.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {questions.length - index}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {q.title || `Question ${q.id.substring(0, 8)}`}
                      </span>
                      {q.isPremium && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Lock className="h-3 w-3" /> VIP
                        </Badge>
                      )}
                      {/* Show difficulty inline on small screens */}
                      <span className="sm:hidden">
                        <Badge
                          variant={
                            q.difficulty === 'Hard'
                              ? 'destructive'
                              : q.difficulty === 'Medium'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {q.difficulty}
                        </Badge>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={
                        q.difficulty === 'Hard'
                          ? 'destructive'
                          : q.difficulty === 'Medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {q.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {q.userStatus === 'completed' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                      >
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Started</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`${basePath}/${q.id}`}>
                      <Button variant="ghost" size="sm">
                        Start
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
