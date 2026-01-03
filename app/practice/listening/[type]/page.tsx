import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Headphones, Play, Clock, Target } from 'lucide-react'

const listeningTypes: Record<string, { name: string; description: string; instructions: string; time: string; aiScored: boolean }> = {
  summarize_spoken_text: {
    name: 'Summarize Spoken Text',
    description: 'Listen to a recording and write a summary',
    instructions: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You will have 10 minutes to finish this task.',
    time: '10 min',
    aiScored: true,
  },
  listening_mc_single: {
    name: 'Multiple Choice (Single Answer)',
    description: 'Listen and select the correct answer',
    instructions: 'Listen to the recording and answer the multiple choice question by selecting the correct response. Only one response is correct.',
    time: '1-2 min',
    aiScored: false,
  },
  listening_mc_multiple: {
    name: 'Multiple Choice (Multiple Answers)',
    description: 'Listen and select all correct answers',
    instructions: 'Listen to the recording and answer the question by selecting all the correct responses. More than one response is correct.',
    time: '1-2 min',
    aiScored: false,
  },
  listening_fill_blanks: {
    name: 'Fill in the Blanks',
    description: 'Listen and type the missing words',
    instructions: 'You will hear a recording. Type the missing words in each blank.',
    time: '1-2 min',
    aiScored: false,
  },
  highlight_correct_summary: {
    name: 'Highlight Correct Summary',
    description: 'Listen and select the paragraph that best summarizes the recording',
    instructions: 'You will hear a recording. Click on the paragraph that best relates to the recording.',
    time: '1-2 min',
    aiScored: false,
  },
  select_missing_word: {
    name: 'Select Missing Word',
    description: 'Listen to a recording with a missing ending and select the correct word',
    instructions: 'You will hear a recording about a particular topic. At the end of the recording the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.',
    time: '1 min',
    aiScored: false,
  },
  highlight_incorrect_words: {
    name: 'Highlight Incorrect Words',
    description: 'Listen and click on words in the transcript that differ from the recording',
    instructions: 'You will hear a recording. Below is a transcription of the recording. Some words in the transcription differ from what the speaker said. Please click on the words that are different.',
    time: '1-2 min',
    aiScored: false,
  },
  write_from_dictation: {
    name: 'Write from Dictation',
    description: 'Listen to a sentence and type exactly what you hear',
    instructions: 'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    time: '1 min',
    aiScored: false,
  },
}

interface PageProps {
  params: Promise<{ type: string }>
}

export default async function ListeningTypePage({ params }: PageProps) {
  const { type } = await params
  const typeInfo = listeningTypes[type]

  if (!typeInfo) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <Link href="/practice/listening" className="hover:text-primary">Listening</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{typeInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/practice/listening">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{typeInfo.name}</h1>
              {typeInfo.aiScored ? (
                <Badge variant="secondary">AI Scored</Badge>
              ) : (
                <Badge variant="outline">Auto Scored</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{typeInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
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
            <Headphones className="h-12 w-12 text-primary" />
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
