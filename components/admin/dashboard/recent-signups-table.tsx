import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AdminUser } from '@/lib/admin/types'

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  premium: 'bg-primary/10 text-primary',
  unlimited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

export function RecentSignupsTable({ users }: { users: AdminUser[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
        <Link href="/admin/users" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge className={`shrink-0 border-0 text-xs capitalize ${tierColors[user.subscriptionTier]}`}>
                {user.subscriptionTier}
              </Badge>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
