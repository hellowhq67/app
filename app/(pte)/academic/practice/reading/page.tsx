import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Clock, BookOpen } from 'lucide-react'

const readingTypes = [
  {
    id: 'reading_mc_single',
    name: 'Multiple Choice (Single Answer)',
    description: 'Read a passage and select the correct answer from options',
    time: '2 min',
    aiScored: false,
    questionCount: 35,
  },
  {
    id: 'reading_mc_multiple',
    name: 'Multiple Choice (Multiple Answers)',
    description: 'Read a passage and select all correct answers',
    time: '2 min',
    aiScored: false,
    questionCount: 30,
  },
  {
    id: 'reorder_paragraphs',
    name: 'Re-order Paragraphs',
    description: 'Arrange paragraphs in the correct logical order',
    time: '2-3 min',
    aiScored: false,
    questionCount: 25,
  },
  {
    id: 'reading_fill_blanks_dropdown',
    name: 'Fill in the Blanks (Dropdown)',
    description: 'Select the correct word from dropdown options',
    time: '2 min',
    aiScored: false,
    questionCount: 40,
  },
  {
    id: 'reading_fill_blanks_drag',
    name: 'Fill in the Blanks (Drag & Drop)',
    description: 'Drag words from a word bank to fill the blanks',
    time: '2 min',
    aiScored: false,
    questionCount: 35,
  },
]

export default function ReadingPracticePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reading Practice</h1>
            <p className="text-muted-foreground">
              Master all 5 reading question types for PTE Academic
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Reading</span>
      </nav>

      {/* Question Types */}
      <div className="grid gap-4">
        {readingTypes.map((type) => (
          <Link key={type.id} href={`/practice/reading/${type.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      {type.aiScored ? (
                        <Badge variant="secondary" className="text-xs">AI Scored</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Auto Scored</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {type.time}
                      </span>
                      <span>{type.questionCount} questions available</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
