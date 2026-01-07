'use client'

import React from 'react'
import { motion } from 'motion/react'
import { UIMessage } from '@ai-sdk/react'
import { User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Message, MessageContent, MessageResponse } from '../ai-elements/message'

interface AIChatMessageProps {
  message: UIMessage
}

export function AIChatMessage({ message }: AIChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
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

      {/* Message Content */}
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
          <Message from={message.role}>
            <MessageContent>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <MessageResponse key={`${message.role}-${i}`}>{part.text}</MessageResponse>;
                  default:
                    return null;
                }
              })}
            </MessageContent>
          </Message>

        </div>
        <span className="text-xs text-muted-foreground px-1">
          {(message as any).createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}
