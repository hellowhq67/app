import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, PenTool, Play, Clock, Target } from 'lucide-react'

const writingTypes: Record<string, { name: string; description: string; instructions: string; time: string; wordCount: string }> = {
  summarize_written_text: {
    name: 'Summarize Written Text',
    description: 'Read a passage and write a one-sentence summary',
    instructions: 'Read the passage below. In 10 minutes, write a one-sentence summary of the passage. Your summary should be between 5 and 75 words. Cut, copy and paste are available.',
    time: '10 min',
    wordCount: '5-75 words',
  },
  write_essay: {
    name: 'Write Essay',
    description: 'Write an essay of 200-300 words on a given topic',
    instructions: 'You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200-300 words.',
    time: '20 min',
    wordCount: '200-300 words',
  },
}

interface PageProps {
  params: Promise<{ type: string }>
}

export default async function WritingTypePage({ params }: PageProps) {
  const { type } = await params
  const typeInfo = writingTypes[type]

  if (!typeInfo) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <Link href="/practice/writing" className="hover:text-primary">Writing</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{typeInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/practice/writing">
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
      <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
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
              Time limit: {typeInfo.time}
            </span>
            <span>Word count: {typeInfo.wordCount}</span>
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
            <PenTool className="h-12 w-12 text-primary" />
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
