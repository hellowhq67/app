'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, PlayCircle } from 'lucide-react'

interface Question {
    id: string
    title: string
    type: string
    difficulty: string
    isActive: boolean
    createdAt: Date
}

interface QuestionListProps {
    questions: Question[]
    total: number
    page: number
    limit: number
    category: string
    types: string[] // Available types for filter
}

export function QuestionList({
    questions,
    total,
    page,
    limit,
    category,
    types,
}: QuestionListProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentType = searchParams.get('type') || 'all'
    const currentDifficulty = searchParams.get('difficulty') || 'all'

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === 'all') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        params.set('page', '1') // Reset to page 1
        router.push(`${pathname}?${params.toString()}`)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Select
                        value={currentType}
                        onValueChange={(val) => handleFilterChange('type', val)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t.replace(/_/g, ' ').toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={currentDifficulty}
                        onValueChange={(val) => handleFilterChange('difficulty', val)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {questions.length} of {total} questions
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No questions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            questions.map((q) => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium">{q.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {q.type.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
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
                                    <TableCell className="text-right">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={`/pte/academic/practice/${category}/${q.type}/${q.id}`}>
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Practice
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
