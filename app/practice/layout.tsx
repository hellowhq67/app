import type { Metadata } from 'next'
import { PTELayoutClient } from '@/components/pte/pte-layout-client'

export const metadata: Metadata = {
    title: "PTE Practice Lab | Pedagogist's",
    description: 'AI-Powered PTE Academic practice and scoring.',
}

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // use the existing PTELayoutClient for consistent nav/sidebar
  return <PTELayoutClient>{children}</PTELayoutClient>
}
