import React from 'react'
import { GeminiRealtimeAgent } from '@/components/ui/gemini-voice-agent'
import { cn } from '@/lib/utils'

interface AIVoiceAssistantProps {
  className?: string
}

export function AIVoiceAssistant({ className }: AIVoiceAssistantProps) {
  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <GeminiRealtimeAgent
        className="flex-1 flex flex-col justify-center items-center gap-8"
      />
    </div>
  )
}
