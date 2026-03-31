import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MockTestDetail } from '@/components/admin/mock-tests/mock-test-detail'
import { getMockTestById } from '@/lib/admin/mock-data'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminMockTestDetailPage({ params }: Props) {
  const { id } = await params
  const test = getMockTestById(id)
  if (!test) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/admin/mock-tests"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Mock Tests
      </Link>
      <MockTestDetail test={test} />
    </div>
  )
}
