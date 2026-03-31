import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserDetailCard } from '@/components/admin/users/user-detail-card'
import { UserAttemptsTable } from '@/components/admin/users/user-attempts-table'
import { getUserById, getAttemptsForUser } from '@/lib/admin/mock-data'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const user = getUserById(id)
  if (!user) notFound()

  const attempts = getAttemptsForUser(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>
      </div>

      <UserDetailCard user={user} />
      <UserAttemptsTable attempts={attempts} />
    </div>
  )
}
