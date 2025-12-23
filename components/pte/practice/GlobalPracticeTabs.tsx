'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Trophy, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface GlobalPracticeTabsProps {
  questionId: string
  isAuthenticated: boolean
}

export function GlobalPracticeTabs({ questionId, isAuthenticated }: GlobalPracticeTabsProps) {
  const [activeTab, setActiveTab] = useState('discussion')

  return (
    <div className="w-full mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
            <TabsTrigger value="discussion" className="flex gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="me" className="flex gap-2">
              <User className="h-4 w-4" />
              Me
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="discussion">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Community discussion for question #{questionId.split('-')[1]}</p>
              {/* TODO: Integrate with GET /api/practice/[id]/discussion */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Top scores for this question</p>
              {/* TODO: Integrate with GET /api/practice/[id]/leaderboard */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="me">
          <Card>
            <CardContent className="p-6">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="bg-muted p-4 rounded-full">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Sign in to view your history</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                      Track your progress, view detailed AI scores, and manage your attempts.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Your attempts will appear here</p>
                  {/* TODO: Integrate with GET /api/practice/[id]/history */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
