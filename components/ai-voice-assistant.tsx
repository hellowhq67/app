'use client'

import React from 'react'
import { RealtimeVoiceAgent } from '@/components/ui/realtime-voice-agent'
import { cn } from '@/lib/utils'

interface AIVoiceAssistantProps {
  className?: string
}

export function AIVoiceAssistant({ className }: AIVoiceAssistantProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <RealtimeVoiceAgent
        sessionType="speaking_practice"
        className="flex-1 flex flex-col justify-start items-stretch gap-4 p-0"
      />
    </div>
  )
}