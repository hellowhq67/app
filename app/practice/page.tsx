import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mic, PenTool, BookOpen, Headphones, ArrowRight } from 'lucide-react'

const sections = [
  {
    name: 'Speaking',
    icon: Mic,
    href: '/practice/speaking',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    description: 'Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, and more',
    questionCount: 7,
  },
  {
    name: 'Writing',
    icon: PenTool,
    href: '/practice/writing',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    description: 'Summarize Written Text, Write Essay',
    questionCount: 2,
  },
  {
    name: 'Reading',
    icon: BookOpen,
    href: '/practice/reading',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    description: 'Multiple Choice, Reorder Paragraphs, Fill in the Blanks',
    questionCount: 5,
  },
  {
    name: 'Listening',
    icon: Headphones,
    href: '/practice/listening',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    description: 'Summarize Spoken Text, Multiple Choice, Write from Dictation',
    questionCount: 8,
  },
]

export default function PracticeHubPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Hub</h1>
        <p className="text-muted-foreground">
          Choose a section to practice. Master each question type to improve your PTE score.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.name} href={section.href}>
            <Card className={`hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50 ${section.bgColor}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-background shadow-sm`}>
                      <section.icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {section.questionCount} question types
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your practice across all sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {sections.map((section) => (
              <div key={section.name} className="text-center p-4 rounded-lg bg-muted/50">
                <section.icon className={`h-8 w-8 mx-auto mb-2 ${section.color}`} />
                <p className="font-medium">{section.name}</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">questions practiced</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
