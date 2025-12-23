'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Attempt {
  createdAt: string
  section: string
  scores: any
}

interface ScoreProgressChartProps {
  attempts: Attempt[]
}

export function ScoreProgressChart({ attempts }: ScoreProgressChartProps) {
  const chartData = useMemo(() => {
    // Group attempts by date and section
    const grouped = attempts.reduce(
      (acc, attempt) => {
        const date = format(new Date(attempt.createdAt), 'MMM dd')
        const score =
          attempt.scores?.total ||
          attempt.scores?.score ||
          attempt.scores?.accuracy * 90 ||
          0

        if (!acc[date]) {
          acc[date] = {
            date,
            speaking: [],
            writing: [],
            reading: [],
            listening: [],
          }
        }

        if (score > 0) {
          acc[date][attempt.section as keyof (typeof acc)[typeof date]].push(
            score
          )
        }

        return acc
      },
      {} as Record<string, any>
    )

    // Calculate averages
    return Object.values(grouped)
      .map((day: any) => ({
        date: day.date,
        Speaking:
          day.speaking.length > 0
            ? Math.round(
                day.speaking.reduce((a: number, b: number) => a + b, 0) /
                  day.speaking.length
              )
            : null,
        Writing:
          day.writing.length > 0
            ? Math.round(
                day.writing.reduce((a: number, b: number) => a + b, 0) /
                  day.writing.length
              )
            : null,
        Reading:
          day.reading.length > 0
            ? Math.round(
                day.reading.reduce((a: number, b: number) => a + b, 0) /
                  day.reading.length
              )
            : null,
        Listening:
          day.listening.length > 0
            ? Math.round(
                day.listening.reduce((a: number, b: number) => a + b, 0) /
                  day.listening.length
              )
            : null,
      }))
      .slice(-14) // Last 14 days
  }, [attempts])

  if (chartData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        No data available
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 90]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Speaking"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6' }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Writing"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Reading"
            stroke="#a855f7"
            strokeWidth={2}
            dot={{ fill: '#a855f7' }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Listening"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
