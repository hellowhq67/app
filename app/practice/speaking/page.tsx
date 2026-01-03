import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Clock, Mic } from 'lucide-react'

const speakingTypes = [
  {
    id: 'read_aloud',
    name: 'Read Aloud',
    description: 'Read a text aloud with correct pronunciation and fluency',
    time: '30-35 sec',
    aiScored: true,
    questionCount: 50,
  },
  {
    id: 'repeat_sentence',
    name: 'Repeat Sentence',
    description: 'Listen and repeat the sentence exactly as you hear it',
    time: '15 sec',
    aiScored: true,
    questionCount: 45,
  },
  {
    id: 'describe_image',
    name: 'Describe Image',
    description: 'Describe what you see in the image in detail',
    time: '40 sec',
    aiScored: true,
    questionCount: 35,
  },
  {
    id: 'retell_lecture',
    name: 'Re-tell Lecture',
    description: 'Listen to a lecture and retell it in your own words',
    time: '40 sec',
    aiScored: true,
    questionCount: 30,
  },
  {
    id: 'answer_short_question',
    name: 'Answer Short Question',
    description: 'Answer a question with a single word or short phrase',
    time: '10 sec',
    aiScored: true,
    questionCount: 40,
  },
  {
    id: 'respond_to_situation',
    name: 'Respond to a Situation',
    description: 'Respond appropriately to a given situation',
    time: '40 sec',
    aiScored: true,
    questionCount: 20,
  },
  {
    id: 'summarize_group_discussion',
    name: 'Summarize Group Discussion',
    description: 'Listen to a group discussion and summarize the main points',
    time: '40 sec',
    aiScored: true,
    questionCount: 15,
  },
]

export default function SpeakingPracticePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
            <Mic className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
            <p className="text-muted-foreground">
              Master all 7 speaking question types for PTE Academic
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/practice" className="hover:text-primary">Practice</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Speaking</span>
      </nav>

      {/* Question Types */}
      <div className="grid gap-4">
        {speakingTypes.map((type) => (
          <Link key={type.id} href={`/practice/speaking/${type.id}`}>
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      {type.aiScored && (
                        <Badge variant="secondary" className="text-xs">AI Scored</Badge>
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
