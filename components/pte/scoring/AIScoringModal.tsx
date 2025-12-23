'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AILoadingState from '@/components/kokonutui/ai-loading'

type AIScoringModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isScoring: boolean
  title?: string
  description?: string
  children?: React.ReactNode
}

export function AIScoringModal({
  open,
  onOpenChange,
  isScoring,
  title = 'AI Scoring in Progress',
  description = 'Our AI is analyzing your response. This may take a moment...',
  children,
}: AIScoringModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-label="AI Scoring Modal">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {isScoring ? (
          <div className="flex items-center justify-center min-h-[300px] py-8">
            <AILoadingState />
          </div>
        ) : (
          <div className="py-4">{children}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

