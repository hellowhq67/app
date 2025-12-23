import type { Metadata } from 'next'
import { PTELayoutClient } from '@/components/pte/pte-layout-client'

export const metadata: Metadata = {
  title: "Pedagogist's PTE Academic Practice",
  description: 'Practice for PTE Academic exam with AI-powered scoring',
}

export default function PTELayout({ children }: { children: React.ReactNode }) {
  return <PTELayoutClient>{children}</PTELayoutClient>
}
