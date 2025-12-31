'use client'

import React, { useState, useEffect } from 'react'
import { PTEQuestion as PTEQuestionType, PTEResponse } from '@/types/pte-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Mic, MicOff, Volume2, ChevronRight } from 'lucide-react'

interface PTEQuestionProps {
  question: PTEQuestionType
  onResponse: (response: any) => void
  onTimeUp: () => void
}

const PTEQuestion: React.FC<PTEQuestionProps> = ({ question, onResponse, onTimeUp }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [response, setResponse] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(question.timing.response)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onTimeUp])

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRecording])

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      onResponse(response)
    } else {
      setIsRecording(true)
      setRecordingTime(0)
    }
  }

  const handleSubmit = () => {
    onResponse(response)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'read_aloud':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg leading-relaxed">{question.content.text}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Read the text aloud</p>
              <Button
                onClick={handleRecord}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="gap-2"
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isRecording ? `Stop (${formatTime(recordingTime)})` : 'Start Recording'}
              </Button>
            </div>
          </div>
        )

      case 'repeat_sentence':
        return (
          <div className="space-y-4">
            {question.content.audioUrl && (
              <div className="text-center">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="outline"
                  className="gap-2"
                >
                  <Volume2 className="h-5 w-5" />
                  {isPlaying ? 'Pause' : 'Play Audio'}
                </Button>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Repeat the sentence</p>
              <Button
                onClick={handleRecord}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="gap-2"
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isRecording ? `Stop (${formatTime(recordingTime)})` : 'Start Recording'}
              </Button>
            </div>
          </div>
        )

      case 'describe_image':
        return (
          <div className="space-y-4">
            {question.content.imageUrl && (
              <div className="text-center">
                <img 
                  src={question.content.imageUrl} 
                  alt="Describe this image"
                  className="max-w-md mx-auto rounded-lg border"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Describe the image in detail</p>
              <Button
                onClick={handleRecord}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="gap-2"
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isRecording ? `Stop (${formatTime(recordingTime)})` : 'Start Recording'}
              </Button>
            </div>
          </div>
        )

      case 'essay':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg font-medium mb-2">Write an essay on the following topic:</p>
              <p className="text-lg">{question.content.question}</p>
            </div>
            <div className="space-y-2">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your essay here..."
                className="min-h-[200px]"
              />
              {question.wordCount && (
                <div className="text-sm text-muted-foreground">
                  Word count: {response.split(/\s+/).filter(word => word.length > 0).length} / {question.wordCount.target}
                </div>
              )}
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Submit Essay
            </Button>
          </div>
        )

      case 'summarize_written_text':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg leading-relaxed">{question.content.passage}</p>
            </div>
            <div className="space-y-2">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your summary here..."
                className="min-h-[100px]"
              />
              {question.wordCount && (
                <div className="text-sm text-muted-foreground">
                  Word count: {response.split(/\s+/).filter(word => word.length > 0).length} / {question.wordCount.target}
                </div>
              )}
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Submit Summary
            </Button>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg">{question.content.question || question.content.text}</p>
            </div>
            <div className="text-center">
              <Button onClick={handleSubmit} className="gap-2">
                Submit Answer
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Question {question.number}
                </CardTitle>
                <Badge variant="outline" className="mt-1">
                  {question.type.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Time Remaining
                </div>
                <div className={`text-2xl font-bold ${
                  timeRemaining < 30 ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={((question.timing.response - timeRemaining) / question.timing.response) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Question Content */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{question.instructions}</p>
            {renderQuestionContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PTEQuestion
