'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Mic, MessageSquare, Sparkles, Clock, Target } from 'lucide-react'

export default function AIVoicePage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight">AI Voice Assistant</h1>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Practice speaking with our AI-powered voice assistant
          </p>
        </div>

        {/* Feature Preview */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Intelligent Conversation Practice
            </CardTitle>
            <CardDescription>
              Have natural conversations with our AI to improve your speaking fluency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <p className="text-muted-foreground">
                  AI Voice Assistant is currently in development
                </p>
                <Button disabled>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Notify Me When Available
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planned Features */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Planned Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Natural Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practice speaking in realistic scenarios like interviews, discussions, and everyday situations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Real-time Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant feedback on pronunciation, fluency, and grammar as you speak.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5" />
                  PTE-Specific Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practice question types like Describe Image, Retell Lecture, and Answer Short Questions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Timed Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practice with time constraints to simulate real test conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
