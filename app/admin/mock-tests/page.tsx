import { MockTestsTable } from '@/components/admin/mock-tests/mock-tests-table'
import { mockMockTests } from '@/lib/admin/mock-data'

export default function AdminMockTestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Mock Tests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor all student mock test sessions and scores.
        </p>
      </div>
      <MockTestsTable tests={mockMockTests} />
    </div>
  )
}
