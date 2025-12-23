'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Clock,
  Target,
  TrendingUp,
  Play,
  Trophy,
  BookOpen,
  Mic,
  Image as ImageIcon,
  GraduationCap,
  MessageCircleQuestion,
  Users,
  MessageSquareText
} from 'lucide-react'
import { SPEAKING_TASKS as speakingTasks } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface SpeakingTaskStats {
  questionsCount: number
  completedCount: number
  averageScore: number
  lastPracticed?: string
}

interface SpeakingNavigationTableProps {
  userStats?: Record<string, SpeakingTaskStats>
  onTaskSelect?: (taskType: string) => void
}

const taskIcons: Record<string, any> = {
  read_aloud: BookOpen,
  repeat_sentence: Mic,
  describe_image: ImageIcon,
  retell_lecture: GraduationCap,
  answer_short_question: MessageCircleQuestion,
  summarize_group_discussion: Users,
  respond_to_situation: MessageSquareText
}

export function SpeakingNavigationTable({
  userStats = {},
  onTaskSelect
}: SpeakingNavigationTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const filteredTasks = speakingTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleTaskClick = (taskType: string) => {
    if (onTaskSelect) {
      onTaskSelect(taskType)
    } else {
      router.push(`/practice/speaking/${taskType}`)
    }
  }

  const getTaskStats = (taskType: string): SpeakingTaskStats => {
    return userStats[taskType] || {
      questionsCount: 0,
      completedCount: 0,
      averageScore: 0
    }
  }

  const getProgressColor = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master all 7 speaking question types with comprehensive practice and AI-powered feedback
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search speaking tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Overall Score: {Object.values(userStats).reduce((acc, stat) => acc + stat.averageScore, 0) / Math.max(Object.keys(userStats).length, 1) || 0}%
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Completed: {Object.values(userStats).reduce((acc, stat) => acc + stat.completedCount, 0)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speaking Tasks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => {
          const stats = getTaskStats(task.type)
          const progressPercentage = stats.questionsCount > 0 ? (stats.completedCount / stats.questionsCount) * 100 : 0
          const IconComponent = taskIcons[task.type] || BookOpen

          return (
            <Card
              key={task.type}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 bg-card/50 backdrop-blur hover:bg-card/80"
              onClick={() => handleTaskClick(task.type)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white", task.color)}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {task.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {task.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>

                {/* Timing Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Prep: {task.prepTime}s
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Record: {task.recordTime}s
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {stats.completedCount}/{stats.questionsCount} questions
                    </span>
                  </div>

                  <Progress
                    value={progressPercentage}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {Math.round(progressPercentage)}% complete
                    </span>
                    {stats.averageScore > 0 && (
                      <span className={cn("font-medium", getScoreColor(stats.averageScore))}>
                        Avg: {Math.round(stats.averageScore)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Practiced */}
                {stats.lastPracticed && (
                  <div className="text-xs text-muted-foreground">
                    Last practiced: {stats.lastPracticed}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskClick(task.type)
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      )}

      {/* Performance Overview */}
      {Object.keys(userStats).length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">
                  {Object.values(userStats).reduce((acc, stat) => acc + stat.completedCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Questions Completed</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">
                  {Math.round(Object.values(userStats).reduce((acc, stat) => acc + stat.averageScore, 0) / Object.keys(userStats).length) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">
                  {Object.values(userStats).filter(stat => stat.averageScore >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">Strong Areas</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">
                  {Object.values(userStats).filter(stat => stat.averageScore < 60).length}
                </div>
                <div className="text-sm text-muted-foreground">Needs Practice</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}