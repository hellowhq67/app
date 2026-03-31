import { Card, CardContent } from '@/components/ui/card'

const metrics = [
  {
    label: 'Uptime (30 days)',
    value: '99.87%',
    sub: '13 min downtime',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Avg Response Time',
    value: '312ms',
    sub: 'Last 24 hours',
    color: 'text-foreground',
  },
  {
    label: 'Error Rate',
    value: '0.12%',
    sub: 'Last 24 hours',
    color: 'text-amber-600 dark:text-amber-400',
  },
]

export function MetricsGrid() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">System Metrics</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`mt-1 text-3xl font-semibold ${m.color}`}>{m.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
