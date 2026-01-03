'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/client'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState({
    targetScore: 79,
    currentEstimate: 65,
    practiceStreak: 0,
    totalPractice: 0,
    memberSince: new Date(),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/profile')
        // const data = await response.json()
        // setProfile(data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const progressToTarget = Math.min(100, (profile.currentEstimate / profile.targetScore) * 100)

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{user?.name || 'PTE Student'}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Badge variant="secondary">
                    <Calendar className="h-3 w-3 mr-1" />
                    Member since {profile.memberSince.toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <Link href="/pte/settings">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Score Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score Progress
            </CardTitle>
            <CardDescription>Your journey to your target score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Estimate</p>
                <p className="text-3xl font-bold">{profile.currentEstimate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Target Score</p>
                <p className="text-3xl font-bold text-primary">{profile.targetScore}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={progressToTarget} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progressToTarget)}% of the way to your goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.practiceStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Practice</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.totalPractice}</div>
              <p className="text-xs text-muted-foreground">Questions answered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points to Target</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{profile.targetScore - profile.currentEstimate}
              </div>
              <p className="text-xs text-muted-foreground">Points needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Section Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Section Performance</CardTitle>
            <CardDescription>Your estimated scores by section</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: 'Speaking', icon: Mic, score: 68, color: 'text-blue-500' },
                { name: 'Writing', icon: PenTool, score: 62, color: 'text-green-500' },
                { name: 'Reading', icon: BookOpen, score: 70, color: 'text-purple-500' },
                { name: 'Listening', icon: Headphones, score: 65, color: 'text-orange-500' },
              ].map((section) => (
                <div
                  key={section.name}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{section.name}</p>
                    <Progress value={(section.score / 90) * 100} className="h-2 mt-1" />
                  </div>
                  <p className="text-2xl font-bold">{section.score}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
