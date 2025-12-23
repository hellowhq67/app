'use client'

import { ReactNode } from 'react'
import { PracticeProvider } from '@/lib/store/practice-session'

export default function PracticeNewLayout({
  children,
}: {
  children: ReactNode
}): ReactNode {
  return (
    <PracticeProvider>
      {children}
    </PracticeProvider>
  )
}