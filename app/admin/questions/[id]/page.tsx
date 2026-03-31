import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { QuestionDetail } from '@/components/admin/questions/question-detail'
import { getQuestionById } from '@/lib/admin/mock-data'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminQuestionDetailPage({ params }: Props) {
  const { id } = await params
  const question = getQuestionById(id)
  if (!question) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/admin/questions"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Questions
      </Link>
      <QuestionDetail question={question} />
    </div>
  )
}
