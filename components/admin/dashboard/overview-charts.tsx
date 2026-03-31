'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartDataPoint, SectionAttemptData } from '@/lib/admin/types'

const SECTION_COLORS: Record<string, string> = {
  Speaking: 'var(--color-chart-1)',
  Writing: 'var(--color-chart-4)',
  Reading: 'var(--color-chart-2)',
  Listening: 'var(--color-chart-5)',
}

interface OverviewChartsProps {
  registrationTrend: ChartDataPoint[]
  sectionAttempts: SectionAttemptData[]
}

export function OverviewCharts({ registrationTrend, sectionAttempts }: OverviewChartsProps) {
  // Show every 5th label
  const filteredTrend = registrationTrend.map((d, i) => ({
    ...d,
    displayDate: i % 5 === 0 ? d.date : '',
  }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Registration Trend */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">New Registrations (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filteredTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="registrationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
              />
              <Area type="monotone" dataKey="value" name="Registrations" stroke="var(--color-primary)" strokeWidth={2} fill="url(#registrationGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attempts by Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Practice Attempts by Section</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectionAttempts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="section" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }}
                labelStyle={{ color: 'var(--color-foreground)' }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
              />
              <Bar dataKey="attempts" name="Attempts" radius={[4, 4, 0, 0]}
                fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
