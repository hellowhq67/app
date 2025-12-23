'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UIMessage } from '@ai-sdk/react'
import { User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

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
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      code: ({ children, className }) => {
                        const isInline = !className
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ) : (
                          <code className={className}>{children}</code>
                        )
                      },
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'underline hover:no-underline',
                            isUser ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                          )}
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {part.text}
                  </ReactMarkdown>
                </div>
              )
            }
            return null
          })}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}
