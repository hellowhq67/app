import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mic, Play, Clock, Target } from 'lucide-react'

const speakingTypes: Record<string, { name: string; description: string; instructions: string; time: string }> = {
  read_aloud: {
    name: 'Read Aloud',
    description: 'Read a text aloud with correct pronunciation and fluency',
    instructions: 'Look at the text below. In 30-40 seconds, you must read this text aloud as naturally and clearly as possible. You will have 30-35 seconds to read aloud.',
    time: '30-35 sec',
  },
  repeat_sentence: {
    name: 'Repeat Sentence',
    description: 'Listen and repeat the sentence exactly as you hear it',
    instructions: 'You will hear a sentence. Please repeat the sentence exactly as you heard it. You will have 15 seconds to speak.',
    time: '15 sec',
  },
  describe_image: {
    name: 'Describe Image',
    description: 'Describe what you see in the image in detail',
    instructions: 'Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.',
    time: '40 sec',
  },
  retell_lecture: {
    name: 'Re-tell Lecture',
    description: 'Listen to a lecture and retell it in your own words',
    instructions: 'You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.',
    time: '40 sec',
  },
  answer_short_question: {
    name: 'Answer Short Question',
    description: 'Answer a question with a single word or short phrase',
    instructions: 'You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.',
    time: '10 sec',
  },
  respond_to_situation: {
    name: 'Respond to a Situation',
    description: 'Respond appropriately to a given situation',
    instructions: 'You will hear a description of a situation. Respond to it as if you were in that situation. You will have 40 seconds to give your response.',
    time: '40 sec',
  },
  summarize_group_discussion: {
    name: 'Summarize Group Discussion',
    description: 'Listen to a group discussion and summarize the main points',
    instructions: 'You will hear a group discussion. Listen carefully and then summarize the main points and opinions expressed. You will have 40 seconds to give your response.',
    time: '40 sec',
  },
}

interface PageProps {
  params: Promise<{ type: string }>
}

export default async function SpeakingTypePage({ params }: PageProps) {
  const { type } = await params
  const typeInfo = speakingTypes[type]

  if (!typeInfo) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <Link href="/practice/speaking" className="hover:text-primary">Speaking</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{typeInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/practice/speaking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{typeInfo.name}</h1>
              <Badge variant="secondary">AI Scored</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{typeInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{typeInfo.instructions}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Response time: {typeInfo.time}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Practice Area */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Session</CardTitle>
          <CardDescription>
            Start practicing {typeInfo.name} questions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Mic className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Practice?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Click the button below to start practicing. You'll be presented with questions one at a time.
          </p>
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Start Practice
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Questions Practiced</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Best Score</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
