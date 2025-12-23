'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bookmark,
  BookmarkCheck,
  Lock,
  Search,
  Eye,
  PlayCircle,
  CheckCircle2,
  Circle,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

export interface UnifiedQuestion {
  id: string
  title: string
  type?: string
  difficulty?: string | null
  bookmarked?: boolean
  practiceCount?: number
  isLocked?: boolean // For pro members
  practiced?: boolean
  tags?: string[]
}

interface UnifiedQuestionsTableProps {
  questions: UnifiedQuestion[]
  section: 'speaking' | 'reading' | 'writing' | 'listening'
  questionType?: string
  basePath?: string
  isProMember?: boolean
  showFilters?: boolean
  showBookmark?: boolean
  showCount?: boolean
  showLock?: boolean
}

export function UnifiedQuestionsTable({
  questions,
  section,
  questionType,
  basePath,
  isProMember = false,
  showFilters = true,
  showBookmark = true,
  showCount = true,
  showLock = true,
}: UnifiedQuestionsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || 'all')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [bookmarkFilter, setBookmarkFilter] = useState(searchParams.get('bookmarked') || 'all')
  const [bookmarking, setBookmarking] = useState<Set<string>>(new Set())

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      searchQuery === '' ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDifficulty =
      difficultyFilter === 'all' || q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'practiced' && (q.practiced || (q.practiceCount ?? 0) > 0)) ||
      (statusFilter === 'not_practiced' && !q.practiced && (q.practiceCount ?? 0) === 0)

    const matchesBookmark =
      bookmarkFilter === 'all' ||
      (bookmarkFilter === 'bookmarked' && q.bookmarked) ||
      (bookmarkFilter === 'not_bookmarked' && !q.bookmarked)

    return matchesSearch && matchesDifficulty && matchesStatus && matchesBookmark
  })

  // Toggle bookmark
  const handleToggleBookmark = useCallback(
    async (questionId: string, currentBookmarked: boolean) => {
      if (bookmarking.has(questionId)) return

      setBookmarking((prev) => new Set(prev).add(questionId))

      try {
        const response = await fetch('/api/questions/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            questionType: section,
            bookmarked: !currentBookmarked,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update bookmark')
        }

        // Update local state
        const question = questions.find((q) => q.id === questionId)
        if (question) {
          question.bookmarked = !currentBookmarked
        }

        toast.success(currentBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
        
        // Refresh if filtering by bookmarks
        if (bookmarkFilter !== 'all') {
          router.refresh()
        }
      } catch (error) {
        console.error('Bookmark error:', error)
        toast.error('Failed to update bookmark')
      } finally {
        setBookmarking((prev) => {
          const next = new Set(prev)
          next.delete(questionId)
          return next
        })
      }
    },
    [section, bookmarkFilter, questions, router]
  )

  // Get practice link
  const getPracticeLink = (question: UnifiedQuestion) => {
    if (basePath) {
      return `${basePath}/${question.type || questionType}/question/${question.id}`
    }
    return `/pte/academic/practice/${section}/${question.type || questionType}/question/${question.id}`
  }

  // Difficulty badge variant
  const getDifficultyVariant = (difficulty?: string | null) => {
    const d = difficulty?.toLowerCase() || 'medium'
    if (d === 'hard') return 'destructive'
    if (d === 'easy') return 'secondary'
    return 'default'
  }

  // Difficulty badge color
  const getDifficultyColor = (difficulty?: string | null) => {
    const d = difficulty?.toLowerCase() || 'medium'
    if (d === 'hard')
      return 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    if (d === 'easy')
      return 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
    return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
  }

  const capitalize = (s?: string | null) => {
    if (!s) return 'Medium'
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="practiced">Practiced</SelectItem>
                  <SelectItem value="not_practiced">Not Practiced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookmark Filter */}
            {showBookmark && (
              <div className="mt-4">
                <Select value={bookmarkFilter} onValueChange={setBookmarkFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Bookmarks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Questions</SelectItem>
                    <SelectItem value="bookmarked">Bookmarked Only</SelectItem>
                    <SelectItem value="not_bookmarked">Not Bookmarked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead className="w-[120px] text-center">Difficulty</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              {showCount && <TableHead className="w-[100px] text-center">Count</TableHead>}
              {showBookmark && <TableHead className="w-[100px] text-center">Bookmark</TableHead>}
              {showLock && <TableHead className="w-[100px] text-center">Access</TableHead>}
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5 + (showCount ? 1 : 0) + (showBookmark ? 1 : 0) + (showLock ? 1 : 0)}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Filter className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        No questions found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your filters or search query
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((question, index) => {
                const isLocked = showLock && question.isLocked && !isProMember
                const isBookmarking = bookmarking.has(question.id)

                return (
                  <TableRow
                    key={question.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={isLocked ? '#' : getPracticeLink(question)}
                          onClick={(e) => {
                            if (isLocked) {
                              e.preventDefault()
                              toast.error('Upgrade to Pro to access this question')
                            }
                          }}
                          className={`${
                            isLocked
                              ? 'text-muted-foreground cursor-not-allowed'
                              : 'text-foreground hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-colors'
                          }`}
                        >
                          {question.title.length > 60
                            ? `${question.title.slice(0, 60)}...`
                            : question.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`border-0 font-normal ${getDifficultyColor(question.difficulty)}`}
                      >
                        {capitalize(question.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {question.practiced || (question.practiceCount ?? 0) > 0 ? (
                        <div className="flex justify-center">
                          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                            <Circle className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </TableCell>
                    {showCount && (
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <Eye className="h-3.5 w-3.5" />
                          {question.practiceCount ?? 0}
                        </div>
                      </TableCell>
                    )}
                    {showBookmark && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleBookmark(question.id, question.bookmarked || false)}
                          disabled={isBookmarking}
                        >
                          {question.bookmarked ? (
                            <BookmarkCheck className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                    {showLock && (
                      <TableCell className="text-center">
                        {isLocked ? (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                            <Lock className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400">
                            Free
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        asChild
                        size="sm"
                        variant={isLocked ? 'outline' : 'default'}
                        disabled={isLocked}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault()
                            toast.error('Upgrade to Pro to practice this question')
                          }
                        }}
                      >
                        <Link href={isLocked ? '#' : getPracticeLink(question)}>
                          <PlayCircle className="mr-1 h-4 w-4" />
                          Practice
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>
    </div>
  )
}

