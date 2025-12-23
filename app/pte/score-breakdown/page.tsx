import { Suspense } from 'react'
import { ScoreBreakdownTable } from '@/components/pte/score-breakdown-table'

export const metadata = {
  title: 'PTE Score Breakdown | Question Types & Score Information',
  description:
    'Comprehensive breakdown of PTE Academic question types, timing, and score contributions',
}

export default function ScoreBreakdownPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading score breakdown...</p>
            </div>
          </div>
        }
      >
        <ScoreBreakdownTable />
      </Suspense>
    </div>
  )
}
