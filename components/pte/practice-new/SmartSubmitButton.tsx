'use client'

import { Button } from '@/components/ui/button'
import { usePracticeSession } from '@/lib/store/practice-session'
import { Loader2, CheckCircle, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartSubmitButtonProps {
  onSubmit: () => Promise<any>
  className?: string
}

export function SmartSubmitButton({ onSubmit, className }: SmartSubmitButtonProps) {
  const { status, isSubmitting, result } = usePracticeSession()

  const handleClick = async () => {
    if (status === 'completed' && result) {
      // Event 2: Already done, showing score (Action: Maybe scroll to score or open details)
      // For now, we just indicate it's done. The user might click to toggle details.
      const scoreElement = document.getElementById('score-results')
      if (scoreElement) scoreElement.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (status === 'answering' || status === 'recording') { // Allow submit if recording finished or answering
       // Event 1: Click to Score
       await usePracticeSession.getState().submitAttempt(onSubmit)
    }
  }

  // Determine button state
  const isReadyToSubmit = status === 'answering' || (status === 'recording' && false) // Usually stop recording first
  const isCompleted = status === 'completed'

  if (isCompleted) {
    return (
      <Button 
        onClick={handleClick}
        className={cn("bg-green-600 hover:bg-green-700 text-white gap-2 transition-all", className)}
      >
        <BarChart2 className="w-4 h-4" />
        View Score {result?.score?.overall || result?.overallScore ? `(${result.score?.overall || result.overallScore})` : ''}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isSubmitting || status === 'idle' || status === 'preparing'}
      className={cn("min-w-[140px] transition-all", className)}
      variant={isSubmitting ? "outline" : "default"}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Scoring...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Click to Score
        </>
      )}
    </Button>
  )
}
