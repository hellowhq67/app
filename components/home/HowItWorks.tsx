import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const STEPS = [
  {
    title: 'Practice by Section',
    desc: 'Choose Speaking, Reading, Listening, or Writing and practice official-like question types.',
  },
  {
    title: 'Get Instant AI Feedback',
    desc: 'Receive scoring and tips on pronunciation, fluency, grammar, vocabulary, and content.',
  },
  {
    title: 'Improve with Analytics',
    desc: 'Track trends, discover weak areas, and follow guided paths to reach your target score.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="how-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          A simple loop to accelerate your PTE preparation.
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="relative">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-start gap-3">
                <span
                  aria-hidden="true"
                  className="bg-primary text-primary-foreground inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                >
                  {i + 1}
                </span>
                <div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="mt-1">{step.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {i === 0 && (
                  <Button asChild variant="outline" size="sm" aria-label="Start practicing">
                    <Link href="/pte/academic/practice">Start practicing</Link>
                  </Button>
                )}
                {i === 1 && (
                  <p className="text-muted-foreground text-sm">AI feedback appears right after each attempt.</p>
                )}
                {i === 2 && (
                  <Button asChild size="sm" aria-label="View analytics">
                    <Link href="/pte/analytics">View analytics</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  )
}