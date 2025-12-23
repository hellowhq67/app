'use client'
// Force dynamic rendering to avoid DB queries during build
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  RotateCcw,
  TrendingUp,
  Users,
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
import { Progress } from '@/components/ui/progress'
import { getTests } from '@/lib/db/queries'
import { PteTest } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MockTestsPage() {
  const { data: tests, error } = useSWR<PteTest[]>('/api/pte-practice', fetcher)

  if (error) return <div>Failed to load mock tests.</div>
  if (!tests) return <div>Loading...</div>

  // Stats calculations based on available data
  const totalTests = tests.length
  const completedTests = 0 // No status in schema yet
  const avgScore = 0 // No score in schema yet
  const bestScore = 0 // No score in schema yet

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-8 rounded-3xl bg-secondary/20 border border-white/5 backdrop-blur-xl">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Mock Test Hall</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Simulate actual exam conditions with 100% accuracy.
          </p>
        </div>
        <Button size="lg" className="rounded-2xl h-14 px-8 font-black shadow-xl shadow-primary/20">
          <Play className="mr-2 h-5 w-5" />
          START QUICK TEST
        </Button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Library', value: totalTests, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Completed', value: completedTests, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Average Score', value: `${avgScore}/90`, icon: TrendingUp, color: 'text-orange-400' },
          { label: 'Personal Best', value: `${bestScore}/90`, icon: BarChart3, color: 'text-purple-400' },
        ].map((stat) => (
          <Card key={stat.label} className="border-white/5 bg-secondary/10 backdrop-blur-sm p-6 hover:translate-y-[-4px] transition-all">
            <div className={`p-2 w-fit rounded-lg bg-white/5 mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-black">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Test List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Active Exam Matrix</h2>
          <div className="flex gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/40 p-1 rounded-xl border border-white/5">
            <div className="px-3 py-1.5 rounded-lg bg-background text-foreground shadow-sm">All Tests</div>
            <div className="px-3 py-1.5">Unattempted</div>
            <div className="px-3 py-1.5">Premium</div>
          </div>
        </div>

        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.id} className="group relative overflow-hidden border-white/5 bg-secondary/10 hover:bg-secondary/20 backdrop-blur-md transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background border border-white/5 flex items-center justify-center font-black text-primary shadow-inner">
                    {test.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold tracking-tight">{test.title}</h3>
                      <Badge variant={test.isPremium ? 'default' : 'secondary'} className={test.isPremium ? "bg-primary/20 text-primary border-primary/20" : ""}>
                        {test.isPremium ? 'PREMIUM' : 'FREE'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{test.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-10">
                  <div className="flex items-center gap-8 text-sm font-bold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {test.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      79+ Suggested
                    </div>
                  </div>
                  <Button asChild className="rounded-xl h-12 px-6 font-black shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
                    <Link href={`/pte/mock-tests/${test.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      LAUNCH
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
