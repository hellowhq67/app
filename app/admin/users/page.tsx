import { UsersTable } from '@/components/admin/users/users-table'
import { mockUsers } from '@/lib/admin/mock-data'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage student accounts, roles, and subscriptions.
        </p>
      </div>
      <UsersTable users={mockUsers} />
    </div>
  )
}
