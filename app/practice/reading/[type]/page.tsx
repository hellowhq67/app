import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, Play, Clock, Target } from 'lucide-react'

const readingTypes: Record<string, { name: string; description: string; instructions: string; time: string }> = {
  reading_mc_single: {
    name: 'Multiple Choice (Single Answer)',
    description: 'Read a passage and select the correct answer',
    instructions: 'Read the text and answer the multiple choice question by selecting the correct response. Only one response is correct.',
    time: '2 min',
  },
  reading_mc_multiple: {
    name: 'Multiple Choice (Multiple Answers)',
    description: 'Read a passage and select all correct answers',
    instructions: 'Read the text and answer the question by selecting all the correct responses. More than one response is correct.',
    time: '2 min',
  },
  reorder_paragraphs: {
    name: 'Re-order Paragraphs',
    description: 'Arrange paragraphs in the correct logical order',
    instructions: 'The text boxes below have been placed in random order. Restore the original order by dragging the text boxes to their correct position.',
    time: '2-3 min',
  },
  reading_fill_blanks_dropdown: {
    name: 'Fill in the Blanks (Dropdown)',
    description: 'Select the correct word from dropdown options',
    instructions: 'Below is a text with blanks. Click on each blank, a list of choices will appear. Select the appropriate answer choice for each blank.',
    time: '2 min',
  },
  reading_fill_blanks_drag: {
    name: 'Fill in the Blanks (Drag & Drop)',
    description: 'Drag words from a word bank to fill the blanks',
    instructions: 'In the text below some words are missing. Drag words from the word bank to fill in the blanks. There are more words than blanks.',
    time: '2 min',
  },
}

interface PageProps {
  params: Promise<{ type: string }>
}

export default async function ReadingTypePage({ params }: PageProps) {
  const { type } = await params
  const typeInfo = readingTypes[type]

  if (!typeInfo) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <Link href="/practice/reading" className="hover:text-primary">Reading</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{typeInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/practice/reading">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{typeInfo.name}</h1>
              <Badge variant="outline">Auto Scored</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{typeInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
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
              Suggested time: {typeInfo.time}
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
            <BookOpen className="h-12 w-12 text-primary" />
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
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
