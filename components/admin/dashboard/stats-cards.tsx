import { Users, Activity, BookOpen, ClipboardList, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/admin/types'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  iconBg: string
}

function StatCard({ title, value, subtitle, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards: StatCardProps[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subtitle: `+${stats.newUsersThisWeek} this week`,
      icon: <Users className="h-5 w-5 text-primary" />,
      iconBg: 'bg-primary/10',
    },
    {
      title: 'Active This Month',
      value: stats.activeThisMonth.toLocaleString(),
      subtitle: `${Math.round((stats.activeThisMonth / stats.totalUsers) * 100)}% of total`,
      icon: <Activity className="h-5 w-5 text-sky-500" />,
      iconBg: 'bg-sky-500/10',
    },
    {
      title: 'Total Questions',
      value: stats.totalQuestions.toLocaleString(),
      subtitle: `${stats.questionsBreakdown.map((q) => `${q.count} ${q.section.slice(0, 2)}`).join(' · ')}`,
      icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
      iconBg: 'bg-emerald-500/10',
    },
    {
      title: 'Mock Tests Taken',
      value: stats.mockTestsTaken.toLocaleString(),
      subtitle: `Avg score ${stats.avgScore}`,
      icon: <ClipboardList className="h-5 w-5 text-amber-500" />,
      iconBg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
