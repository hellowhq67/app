'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIVoiceAssistant } from '@/components/ai-voice-assistant'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceAssistantSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function VoiceAssistantSidebar({ isOpen, onClose }: VoiceAssistantSidebarProps) {
  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md',
          'bg-background border-l shadow-2xl',
          'flex flex-col'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">AI Assistant</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AIVoiceAssistant className="h-full shadow-none border-0" />
        </div>
      </motion.div>
    </>
  )
}
