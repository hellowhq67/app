import { CheckCircle, XCircle, Calendar, Trophy, Target, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AdminUser } from '@/lib/admin/types'

const tierStyle: Record<string, string> = {
  free: 'bg-muted text-muted-foreground border-0',
  basic: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-0',
  premium: 'bg-primary/10 text-primary border-0',
  unlimited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
}

const roleStyle: Record<string, string> = {
  user: 'bg-muted text-muted-foreground border-0',
  teacher: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-0',
  admin: 'bg-destructive/10 text-destructive border-0',
}

interface StatMiniCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
}

function StatMiniCard({ label, value, icon }: StatMiniCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserDetailCard({ user }: { user: AdminUser }) {
  return (
    <div className="space-y-4">
      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
                <Badge className={`text-xs capitalize ${roleStyle[user.role]}`}>{user.role}</Badge>
                <Badge className={`text-xs capitalize ${tierStyle[user.subscriptionTier]}`}>
                  {user.subscriptionTier}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {user.emailVerified
                    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                  {user.emailVerified ? 'Email verified' : 'Email not verified'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {user.examDate && (
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Exam: {new Date(user.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {user.subscriptionExpiresAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Plan expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMiniCard label="Total Attempts" value={user.totalAttempts} icon={<Target className="h-4 w-4" />} />
        <StatMiniCard label="Avg Score" value={`${user.avgScore}%`} icon={<Trophy className="h-4 w-4" />} />
        <StatMiniCard label="Mock Tests" value={user.mockTestsTaken} icon={<Trophy className="h-4 w-4" />} />
        <StatMiniCard label="AI Credits Used" value={`${user.aiCreditsUsed}/${user.dailyAiCredits}`} icon={<Zap className="h-4 w-4" />} />
      </div>
    </div>
  )
}
