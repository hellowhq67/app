'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Target } from 'lucide-react'

interface ExamCountdownMiniProps {
  examDate?: string
  targetScore?: number
}

export function ExamCountdownMini({ examDate, targetScore = 79 }: ExamCountdownMiniProps) {
  const [daysRemaining, setDaysRemaining] = useState<number>(0)

  useEffect(() => {
    const calculateDaysRemaining = () => {
      if (!examDate) return 0
      
      const exam = new Date(examDate)
      const today = new Date()
      const diffTime = exam.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return Math.max(0, diffDays)
    }

    setDaysRemaining(calculateDaysRemaining())
  }, [examDate])

  if (!examDate) {
    return (
      <Card className="px-3 py-2">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>Target: {targetScore}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="px-3 py-2">
      <CardContent className="p-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{daysRemaining} days</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Target: {targetScore}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
