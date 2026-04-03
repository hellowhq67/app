"use client"

import dynamic from 'next/dynamic'
import { StatsCards } from '@/components/admin/dashboard/stats-cards'
import { RecentSignupsTable } from '@/components/admin/dashboard/recent-signups-table'
import {
  mockDashboardStats,
  mockRegistrationTrend,
  mockSectionAttempts,
  mockUsers,
} from '@/lib/admin/mock-data'

const OverviewCharts = dynamic(
  () => import('@/components/admin/dashboard/overview-charts').then((m) => m.OverviewCharts),
  { ssr: false }
)

export default function AdminDashboardPage() {
  const recentUsers = [...mockUsers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of platform activity and key metrics.
        </p>
      </div>

      <StatsCards stats={mockDashboardStats} />

      <OverviewCharts
        registrationTrend={mockRegistrationTrend}
        sectionAttempts={mockSectionAttempts}
      />

      <RecentSignupsTable users={recentUsers} />
    </div>
  )
}
