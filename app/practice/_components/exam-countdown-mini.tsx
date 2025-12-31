'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExamCountdownMiniProps {
  targetDate?: string
}

// Lightweight countdown badge used in the practice header. If no targetDate is
// provided it just shows a "No exam set" state.
export function ExamCountdownMini({ targetDate }: ExamCountdownMiniProps) {
  const [label, setLabel] = useState<string>('No exam set')

  useEffect(() => {
    if (!targetDate) {
      setLabel('No exam set')
      return
    }

    const target = new Date(targetDate).getTime()

    const update = () => {
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) {
        setLabel('Today')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days <= 0) {
        setLabel('< 1 day')
      } else {
        setLabel(`${days} day${days === 1 ? '' : 's'} left`)
      }
    }

    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-1 rounded-full border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200 text-[11px] font-semibold px-3 py-1"
    >
      <Clock className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  )
}
