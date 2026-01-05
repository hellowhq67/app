import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Clock, Headphones } from 'lucide-react'

const listeningTypes = [
  {
    id: 'summarize_spoken_text',
    name: 'Summarize Spoken Text',
    description: 'Listen to a recording and write a summary (50-70 words)',
    time: '10 min',
    aiScored: true,
    questionCount: 25,
  },
  {
    id: 'listening_mc_single',
    name: 'Multiple Choice (Single Answer)',
    description: 'Listen and select the correct answer',
    time: '1-2 min',
    aiScored: false,
    questionCount: 30,
  },
  {
    id: 'listening_mc_multiple',
    name: 'Multiple Choice (Multiple Answers)',
    description: 'Listen and select all correct answers',
    time: '1-2 min',
    aiScored: false,
    questionCount: 25,
  },
  {
    id: 'listening_fill_blanks',
    name: 'Fill in the Blanks',
    description: 'Listen and type the missing words',
    time: '1-2 min',
    aiScored: false,
    questionCount: 35,
  },
  {
    id: 'highlight_correct_summary',
    name: 'Highlight Correct Summary',
    description: 'Listen and select the paragraph that best summarizes the recording',
    time: '1-2 min',
    aiScored: false,
    questionCount: 20,
  },
  {
    id: 'select_missing_word',
    name: 'Select Missing Word',
    description: 'Listen to a recording with a missing ending and select the correct word',
    time: '1 min',
    aiScored: false,
    questionCount: 25,
  },
  {
    id: 'highlight_incorrect_words',
    name: 'Highlight Incorrect Words',
    description: 'Listen and click on words in the transcript that differ from the recording',
    time: '1-2 min',
    aiScored: false,
    questionCount: 30,
  },
  {
    id: 'write_from_dictation',
    name: 'Write from Dictation',
    description: 'Listen to a sentence and type exactly what you hear',
    time: '1 min',
    aiScored: false,
    questionCount: 40,
  },
]

export default function ListeningPracticePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-950">
            <Headphones className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Listening Practice</h1>
            <p className="text-muted-foreground">
              Master all 8 listening question types for PTE Academic
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Listening</span>
      </nav>

      {/* Question Types */}
      <div className="grid gap-4">
        {listeningTypes.map((type) => (
          <Link key={type.id} href={`/practice/listening/${type.id}`}>
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
