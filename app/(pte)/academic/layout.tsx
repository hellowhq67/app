'use client'

import { ReactNode } from 'react'
import { PracticeProvider } from '@/lib/pte/practice-context'
import { PracticeSidebar } from './_components/PracticeSidebar'

export default function AcademicLayout({
  children,
}: {
  children: ReactNode
}): ReactNode {
  return (
    <PracticeProvider>
      <div className="relative min-h-screen">
        {children}
        <PracticeSidebar />
      </div>
    </PracticeProvider>
  )
}