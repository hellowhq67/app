'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, Target, TrendingUp, User } from 'lucide-react'

interface PracticeAttempt {
  id: string
  questionType: string
  score: number
  maxScore: number
  timeSpent: number
  completedAt: string
  feedback?: string
}

export function PracticeAttemptsClient() {
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading practice attempts
    const mockAttempts: PracticeAttempt[] = [
      {
        id: '1',
        questionType: 'Read Aloud',
        score: 85,
        maxScore: 90,
        timeSpent: 45,
        completedAt: '2024-01-15T10:30:00Z',
        feedback: 'Good pronunciation and fluency'
      },
      {
        id: '2',
        questionType: 'Repeat Sentence',
        score: 78,
        maxScore: 90,
        timeSpent: 15,
        completedAt: '2024-01-15T10:35:00Z',
        feedback: 'Focus on accuracy'
      },
      {
        id: '3',
        questionType: 'Essay',
        score: 82,
        maxScore: 90,
        timeSpent: 1200,
        completedAt: '2024-01-15T11:00:00Z',
        feedback: 'Well-structured essay'
      }
    ]

    setTimeout(() => {
      setAttempts(mockAttempts)
      setIsLoading(false)
    }, 1000)
  }, [])

  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, attempt) => acc + (attempt.score / attempt.maxScore * 100), 0) / attempts.length)
    : 0

  const totalTimeSpent = attempts.reduce((acc, attempt) => acc + attempt.timeSpent, 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attempts.length}</div>
            <p className="text-xs text-muted-foreground">Practice sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">Performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)}m</div>
            <p className="text-xs text-muted-foreground">Total practice time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attempts.filter(a => {
              const attemptDate = new Date(a.completedAt)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return attemptDate > weekAgo
            }).length}</div>
            <p className="text-xs text-muted-foreground">Recent attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Practice Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{attempt.questionType}</h3>
                    <Badge variant="outline">
                      {Math.round((attempt.score / attempt.maxScore) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {attempt.feedback && (
                    <p className="text-sm text-muted-foreground mt-1">{attempt.feedback}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{attempt.score}/{attempt.maxScore}</div>
                  <Progress value={(attempt.score / attempt.maxScore) * 100} className="w-20 h-2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
