import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Testimonial = {
  name: string
  role: string
  quote: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sara K.',
    role: 'PTE 79+ Achiever',
    quote:
      'The AI feedback on speaking was spot on. I improved fluency in 2 weeks and hit my target score.',
  },
  {
    name: 'Amit P.',
    role: 'International Student',
    quote:
      'Mock tests felt like the real exam. The analytics showed exactly where I was losing points.',
  },
  {
    name: 'Jenny L.',
    role: 'Working Professional',
    quote:
      'Tight schedule, big goals. The timed practice and quick tips made my prep efficient and focused.',
  },
]

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="testimonials-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Results our learners love
        </h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">
          Hear from students who reached their goals faster.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="h-full">
            <CardHeader>
              <CardTitle className="text-base">{t.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{t.role}</p>
            </CardHeader>
            <CardContent>
              <blockquote>
                <p className="leading-relaxed">“{t.quote}”</p>
              </blockquote>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}