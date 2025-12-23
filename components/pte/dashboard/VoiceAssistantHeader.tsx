'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { X, Settings, Sparkles } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VoiceAssistantHeaderProps {
  onClose: () => void
  status: string
  connectionType: 'webrtc' | 'websocket'
  onConnectionTypeChange: (type: 'webrtc' | 'websocket') => void
}

export function VoiceAssistantHeader({
  onClose,
  status,
  connectionType,
  onConnectionTypeChange,
}: VoiceAssistantHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">PTE Voice Assistant</h3>
          <p className="text-xs text-white/80 capitalize">
            {status === 'idle' ? 'Ready' : status}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Select
          value={connectionType}
          onValueChange={(value) => onConnectionTypeChange(value as 'webrtc' | 'websocket')}
        >
          <SelectTrigger className="h-8 w-32 bg-white/10 border-white/20 text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webrtc">WebRTC</SelectItem>
            <SelectItem value="websocket">WebSocket</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onClose}
          aria-label="Close voice assistant"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
