import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CTA() {
  return (
    <section
      id="get-started"
      aria-labelledby="cta-heading"
      className="from-background to-muted/40 mx-auto w-full bg-gradient-to-b"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-2xl border bg-card px-6 py-12 text-center shadow-sm sm:px-12 md:py-16">
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to boost your PTE score?
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base sm:text-lg">
            Start practicing free today and unlock AI feedback, mock tests, and analytics when you upgrade.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" aria-label="Create your account">
              <Link href="/sign-up">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" aria-label="View pricing plans">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-xs">
            No credit card required to sign up.
          </p>
        </div>
      </div>
    </section>
  )
}