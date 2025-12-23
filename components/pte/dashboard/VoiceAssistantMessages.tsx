'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

interface VoiceAssistantMessagesProps {
  messages: Message[]
  status: string
}

export function VoiceAssistantMessages({ messages, status }: VoiceAssistantMessagesProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-4 dark:from-blue-900/30 dark:to-purple-900/30">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              Hi! I'm your PTE Voice Assistant
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              I can help you with study planning, answer questions about PTE, and guide you through practice sections.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            return (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  isUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400'
                  )}
                >
                  {isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                
                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[80%]',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 shadow-sm',
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.timestamp && (
                    <span className="text-xs text-muted-foreground px-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          
          {status === 'listening' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Listening...</span>
            </div>
          )}
          
          {status === 'speaking' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Assistant is speaking...</span>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  )
}
