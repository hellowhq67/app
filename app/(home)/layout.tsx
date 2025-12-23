import { Suspense } from 'react'
import { CookieConsentBanner } from '@/components/cookie-consent'
import { FloatingNavbar } from '@/components/floating-navbar'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-screen flex-col">
      <FloatingNavbar />
      {children}
      <CookieConsentBanner />
    </section>
  )
}