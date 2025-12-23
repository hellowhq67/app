'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Trophy, User, Lock, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-client' // Assuming this exists from context
import { cn } from '@/lib/utils'

interface PracticeCommunityTabsProps {
  questionId: string
  className?: string
}

export function PracticeCommunityTabs({ questionId, className }: PracticeCommunityTabsProps) {
  const [activeTab, setActiveTab] = useState('discussion')
  const { data: session } = useAuth() // Client-side auth check

  return (
    <div className={cn("w-full max-w-4xl mx-auto mt-12", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
        
        {/* Centered Tab List */}
        <TabsList className="grid w-full max-w-md grid-cols-3 h-12 bg-muted/50 p-1 mb-6 rounded-full">
          <TabsTrigger value="discussion" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="me" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" />
            Me
          </TabsTrigger>
        </TabsList>

        {/* Content Area */}
        <div className="w-full">
          <TabsContent value="discussion" className="mt-0">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                {/* Discussion Component Placeholder */}
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">Community Discussion</h3>
                  <p className="text-muted-foreground text-sm">Share tips and strategies for this question.</p>
                  <Button variant="outline" className="mt-4">Start Discussion</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                {/* Leaderboard Component Placeholder */}
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">Top Scorers</h3>
                  <p className="text-muted-foreground text-sm">See how others performed on this question.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="me" className="mt-0">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                {!session ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
                    <div className="bg-muted p-4 rounded-full mb-4">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Sign in to view your history</h3>
                    <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
                      Track your progress, view detailed AI scores, and manage your attempts for this question.
                    </p>
                    <div className="flex gap-4">
                      <Button asChild variant="default">
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/sign-up">Create Account</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <History className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Your Attempts</h3>
                    <p className="text-muted-foreground text-sm">You haven't practiced this question yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
