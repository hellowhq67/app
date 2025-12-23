'use client'

import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Attempt {
  createdAt: string
  section: string
}

interface AttemptsChartProps {
  attempts: Attempt[]
}

export function AttemptsChart({ attempts }: AttemptsChartProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      return format(date, 'MMM dd')
    })

    // Count attempts per day and section
    const counts = attempts.reduce(
      (acc, attempt) => {
        const date = format(new Date(attempt.createdAt), 'MMM dd')

        if (!acc[date]) {
          acc[date] = {
            date,
            speaking: 0,
            writing: 0,
            reading: 0,
            listening: 0,
          }
        }

        acc[date][attempt.section]++
        return acc
      },
      {} as Record<string, any>
    )

    // Fill in missing days with zeros
    return last7Days.map(
      (date) =>
        counts[date] || {
          date,
          speaking: 0,
          writing: 0,
          reading: 0,
          listening: 0,
        }
    )
  }, [attempts])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="speaking" fill="#3b82f6" name="Speaking" stackId="a" />
          <Bar dataKey="writing" fill="#10b981" name="Writing" stackId="a" />
          <Bar dataKey="reading" fill="#a855f7" name="Reading" stackId="a" />
          <Bar
            dataKey="listening"
            fill="#f97316"
            name="Listening"
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
