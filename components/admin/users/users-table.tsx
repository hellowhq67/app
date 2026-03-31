'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { AdminUser, SubscriptionTier, UserRole } from '@/lib/admin/types'

const tierStyle: Record<SubscriptionTier, string> = {
  free: 'bg-muted text-muted-foreground border-0',
  basic: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-0',
  premium: 'bg-primary/10 text-primary border-0',
  unlimited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
}

const roleStyle: Record<UserRole, string> = {
  user: 'bg-muted text-muted-foreground border-0',
  teacher: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-0',
  admin: 'bg-destructive/10 text-destructive border-0',
}

const statusStyle: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  expired: 'bg-muted text-muted-foreground border-0',
  cancelled: 'bg-destructive/10 text-destructive border-0',
  trial: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchTier = tierFilter === 'all' || u.subscriptionTier === tierFilter
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchTier && matchRole
    })
  }, [users, search, tierFilter, roleFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="unlimited">Unlimited</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 && 's'}</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-56">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Credits</TableHead>
              <TableHead>Practice</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No users match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2.5 group">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs capitalize ${roleStyle[user.role]}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs capitalize ${tierStyle[user.subscriptionTier]}`}>
                      {user.subscriptionTier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs capitalize ${statusStyle[user.subscriptionStatus]}`}>
                      {user.subscriptionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-foreground">
                        {user.aiCreditsUsed}/{user.dailyAiCredits}
                      </span>
                      <Progress
                        value={(user.aiCreditsUsed / user.dailyAiCredits) * 100}
                        className="h-1.5 w-14"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-foreground">
                        {user.practiceQuestionsUsed}/{user.dailyPracticeLimit}
                      </span>
                      <Progress
                        value={(user.practiceQuestionsUsed / user.dailyPracticeLimit) * 100}
                        className="h-1.5 w-14"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
