'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  DollarSign, 
  Calendar, 
  HelpCircle,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIChatActionsProps {
  onAction: (action: string) => void
  compact?: boolean
}

const quickActions = [
  {
    id: 'start-practice',
    label: 'Start Practice',
    icon: BookOpen,
    description: 'Begin practicing PTE questions',
  },
  {
    id: 'view-pricing',
    label: 'View Pricing',
    icon: DollarSign,
    description: 'See our pricing plans',
  },
  {
    id: 'book-demo',
    label: 'Book Demo',
    icon: Calendar,
    description: 'Schedule a demo session',
  },
  {
    id: 'faq',
    label: 'FAQs',
    icon: HelpCircle,
    description: 'Common questions',
  },
]

export function AIChatActions({ onAction, compact = false }: AIChatActionsProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => onAction(action.id)}
              className="text-xs"
            >
              <Icon className="mr-1.5 h-3 w-3" />
              {action.label}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {quickActions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={cn(
              'group relative overflow-hidden rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">
                  {action.label}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
