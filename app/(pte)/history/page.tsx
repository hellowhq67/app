'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/client'

interface AttemptItem {
  id: string
  type: string
  questionType: string
  score?: number
  maxScore: number
  createdAt: Date
  section: 'speaking' | 'writing' | 'reading' | 'listening'
}

const sectionIcons = {
  speaking: Mic,
  writing: PenTool,
  reading: BookOpen,
  listening: Headphones,
}

export default function HistoryPage() {
  const { isAuthenticated } = useAuth()
  const [attempts, setAttempts] = useState<AttemptItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/attempts')
        // const data = await response.json()
        // setAttempts(data)

        // Mock data for now
        setAttempts([])
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchHistory()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your history</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  const filteredAttempts = activeTab === 'all'
    ? attempts
    : attempts.filter(a => a.section === activeTab)

  const stats = {
    total: attempts.length,
    speaking: attempts.filter(a => a.section === 'speaking').length,
    writing: attempts.filter(a => a.section === 'writing').length,
    reading: attempts.filter(a => a.section === 'reading').length,
    listening: attempts.filter(a => a.section === 'listening').length,
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl mx-auto px-4 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Practice History</h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and review past attempts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Speaking</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.speaking}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Writing</CardTitle>
              <PenTool className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.writing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reading}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listening</CardTitle>
              <Headphones className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.listening}</div>
            </CardContent>
          </Card>
        </div>

        {/* History Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="listening">Listening</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredAttempts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Practice History</h3>
                  <p className="text-muted-foreground mb-4">
                    Start practicing to see your history here.
                  </p>
                  <Link href="/practice">
                    <Button>Start Practicing</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {filteredAttempts.map((attempt) => {
                        const Icon = sectionIcons[attempt.section]
                        return (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{attempt.questionType}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(attempt.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant={attempt.score && attempt.score >= 70 ? 'default' : 'secondary'}>
                                {attempt.score ?? '-'}/{attempt.maxScore}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
