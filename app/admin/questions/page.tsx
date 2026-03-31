import { QuestionsTable } from '@/components/admin/questions/questions-table'
import { mockQuestions } from '@/lib/admin/mock-data'

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Question Bank</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Browse and manage all practice questions across sections.
        </p>
      </div>
      <QuestionsTable questions={mockQuestions} />
    </div>
  )
}
