import { PracticeAttemptsClient } from '@/components/pte/practice-attempts/practice-attempts-client'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export const metadata = {
  title: 'Practice Attempts - PTE Academic',
  description: 'View and analyze your practice attempts across all sections',
}

function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PracticeAttemptsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <AcademicPracticeHeader section="practice" showFilters={false} />

        <div className="mt-8 space-y-6">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              Practice Attempts
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your progress, analyze scores, and set your exam goals
            </p>
          </div>

          <Suspense fallback={<Loading />}>
            <PracticeAttemptsClient />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
