'use client'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'

import { useEffect, useState, useOptimistic, useActionState, useCallback, useEffectEvent } from 'react'
import {
  BookOpen,
  Calendar,
  Edit,
  GraduationCap,
  Settings,
  Target,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react'
import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User as UserType } from '@/lib/db/schema'
import { motion } from 'motion/react'

type UIUser = UserType & {
  targetScore?: number | null
  examDate?: string | Date | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getLevel = (score: number) => {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

export default function ProfilePage() {
  const { data: user, error, mutate } = useSWR<UIUser>('/api/user', fetcher)
  const { data: progress } = useSWR('/api/user/progress', fetcher)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<Partial<UIUser>>({})
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (state, update: Partial<UIUser>) => ({ ...state, ...update } as UIUser)
  )

  const saveProfile = async (prevState: any, newData: Partial<UIUser>) => {
    setOptimisticUser(newData)
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      const updatedUser = await response.json()
      mutate(updatedUser)
      return { success: true }
    } catch (error) {
      console.error('Failed to save profile:', error)
      if (user) {
        if (user) {
          setOptimisticUser(user)
        }
      }
      return { success: false, error }
    }
  }

  const [saveState, saveAction, isPending] = useActionState(saveProfile, { success: true })

  const handleSave = useCallback(() => {
    setIsEditing(false)
    saveAction(profileData)
  }, [profileData, saveAction])

  const handleInputChange = useCallback((field: keyof UIUser, value: unknown) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  if (error) return <div>Failed to load user data.</div>
  if (!user) return <div>Loading...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header with Glass Effect */}
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-8 rounded-3xl bg-secondary/20 border border-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">My Profile</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Empowering your PTE journey since {optimisticUser?.createdAt ? new Date(optimisticUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button variant="outline" className="rounded-xl bg-white/5 border-white/10 hover:bg-white/10" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Trophy className="mr-2 h-4 w-4" />
            View Certificates
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Col: Profile & Identity */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-white/5 bg-secondary/10 backdrop-blur-md overflow-hidden hover:bg-secondary/15 transition-all">
            <CardHeader className="items-center pb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-3xl font-black text-white shadow-2xl border-4 border-background">
                  {optimisticUser?.name?.split(' ').map(n => n[0]).join('')}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white rounded-full p-2.5 cursor-pointer shadow-lg transition-transform hover:scale-110">
                    <Upload className="h-4 w-4" />
                    <Input type="file" className="hidden" />
                  </label>
                )}
              </div>
              <CardTitle className="mt-6 text-2xl font-bold">{optimisticUser?.name}</CardTitle>
              <CardDescription className="text-base text-primary font-medium">{optimisticUser?.role || 'Ultimate Student'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-background/40 border border-white/5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Member Since</span>
                    <span className="font-semibold">{optimisticUser?.createdAt ? new Date(optimisticUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-background/40 border border-white/5">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Target Exam Date</span>
                    <span className="font-semibold">Not Scheduled</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button variant="ghost" className="justify-start gap-3 rounded-xl hover:bg-white/5 px-4 h-12">
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Button>
                <Button variant="ghost" className="justify-start gap-3 rounded-xl hover:bg-white/5 px-4 h-12">
                  <BookOpen className="h-4 w-4" />
                  Learning Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Stats & Goals */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tests Done', value: progress?.testsCompleted || 0, icon: BookOpen, color: 'text-blue-400' },
              { label: 'Hours Spent', value: `${progress?.practiceTime || 0}h`, icon: Calendar, color: 'text-green-400' },
              { label: 'Current Streak', value: progress?.dayStreak || 0, icon: Zap, color: 'text-orange-400' },
              { label: 'Level', value: progress?.overallScore ? getLevel(progress.overallScore) : 'N/A', icon: Trophy, color: 'text-purple-400' },
            ].map((stat) => (
              <Card key={stat.label} className="border-white/5 bg-secondary/10 backdrop-blur-sm p-4 hover:translate-y-[-4px] transition-all">
                <div className={`p-2 w-fit rounded-lg bg-white/5 mb-3`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-bold tracking-wider uppercase">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Performance Deep Dive */}
          <Card className="border-white/5 bg-secondary/10 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Performance Journey</CardTitle>
                  <CardDescription>Track your growth towards your goal</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-primary leading-none">{progress?.overallScore || 0}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mt-1">Overall CR</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Progress to Target
                    </span>
                    <div className="text-2xl font-black">
                      {progress?.overallScore || 0} <span className="text-muted-foreground/30 mx-2">/</span> {optimisticUser?.targetScore || 90}
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-1 bg-primary/20 text-primary border-primary/20">
                    +{Math.max(0, (optimisticUser?.targetScore || 90) - (progress?.overallScore || 0))} pts remaining
                  </Badge>
                </div>

                <div className="relative h-4 w-full rounded-full bg-secondary overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((progress?.overallScore || 0) / (optimisticUser?.targetScore || 90)) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary via-blue-400 to-accent shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                <div className="flex-1">
                  <Label className="text-xs font-black uppercase text-muted-foreground mb-2 block">Set New Target Score</Label>
                  <div className="flex gap-2">
                    <Input
                      value={profileData.targetScore || optimisticUser?.targetScore || 90}
                      onChange={(e) => handleInputChange('targetScore', e.target.value)}
                      disabled={!isEditing}
                      type="number"
                      min="10"
                      max="90"
                      className="rounded-xl border-white/5 bg-background h-12 text-lg font-bold"
                    />
                    <Button
                      disabled={!isEditing || isPending}
                      onClick={handleSave}
                      className="h-12 rounded-xl"
                    >
                      Update Goal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={optimisticUser?.role || 'PTE Student'} disabled={true} />
              </div>

              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input id="joinDate" value={optimisticUser?.createdAt ? new Date(optimisticUser.createdAt).toLocaleDateString() : ''} disabled={true} />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
