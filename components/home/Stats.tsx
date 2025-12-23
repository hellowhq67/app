import React from 'react'

const STATS = [
  { label: 'Students Practicing', value: '25,000+' },
  { label: 'Practice Questions', value: '50k+' },
  { label: 'Mock Tests Completed', value: '120k+' },
  { label: 'Avg. Score Gain', value: '+12' },
]

export default function Stats() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="bg-accent/30 text-accent-foreground/90 border-border/60 mx-auto w-full border-y"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="stats-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Trusted by learners worldwide
          </h2>
          <p className="text-muted-foreground mt-2">
            Real practice. Real improvement. Real results.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg px-4 py-6">
              <dt className="text-muted-foreground text-sm">{s.label}</dt>
              <dd className="mt-1 text-2xl font-bold sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}