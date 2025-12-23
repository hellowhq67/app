'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceAssistantControlsProps {
  conversation: any
  status: string
  connectionType: 'webrtc' | 'websocket'
}

export function VoiceAssistantControls({
  conversation,
  status,
  connectionType,
}: VoiceAssistantControlsProps) {
  const [textInput, setTextInput] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleStartSession = async () => {
    try {
      setIsConnecting(true)
      const response = await fetch(`/api/ai/voice?connectionType=${connectionType}`)
      if (!response.ok) throw new Error('Failed to get voice credentials')
      
      const { token, signedUrl } = await response.json()
      
      if (connectionType === 'webrtc' && token) {
        await conversation.startSession({
          conversationToken: token,
          connectionType: 'webrtc',
        })
      } else if (connectionType === 'websocket' && signedUrl) {
        await conversation.startSession({
          signedUrl,
          connectionType: 'websocket',
        })
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleEndSession = async () => {
    try {
      await conversation.endSession()
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  const handleSendText = () => {
    if (textInput.trim() && conversation.sendText) {
      conversation.sendText(textInput)
      setTextInput('')
    }
  }

  const isActive = status === 'listening' || status === 'speaking' || status === 'connected'
  const canInteract = status === 'idle' || status === 'connected'

  return (
    <div className="border-t p-4 space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )}
          />
          <span className="text-muted-foreground capitalize">
            {status === 'idle' ? 'Ready' : status}
          </span>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-2">
        {status === 'idle' ? (
          <Button
            onClick={handleStartSession}
            disabled={isConnecting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Chat
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleEndSession}
              variant="outline"
              className="flex-1"
            >
              <MicOff className="mr-2 h-4 w-4" />
              End Session
            </Button>
          </>
        )}
      </div>

      {/* Text Input (Fallback) */}
      {canInteract && (
        <div className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendText()
              }
            }}
            disabled={!canInteract}
          />
          <Button
            onClick={handleSendText}
            disabled={!textInput.trim() || !canInteract}
            size="icon"
            variant="outline"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-center text-muted-foreground">
        {status === 'idle'
          ? 'Click "Start Voice Chat" to begin'
          : status === 'listening'
          ? 'Speak now...'
          : status === 'speaking'
          ? 'Assistant is speaking...'
          : 'Voice assistant is active'}
      </p>
    </div>
  )
}
