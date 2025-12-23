'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mic, PenTool, BookOpen, Headphones, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const PRACTICE_SECTIONS = [
  {
    id: 'speaking',
    title: 'Speaking Practice',
    description: 'Improve your speaking skills with AI-powered feedback',
    icon: Mic,
    color: 'text-blue-500 bg-blue-50',
    link: '/practice/speaking',
    questions: 1250
  },
  {
    id: 'writing',
    title: 'Writing Practice',
    description: 'Enhance your writing with guided prompts and feedback',
    icon: PenTool,
    color: 'text-green-500 bg-green-50',
    link: '/practice/writing',
    questions: 850
  },
  {
    id: 'reading',
    title: 'Reading Practice',
    description: 'Master reading comprehension with various question types',
    icon: BookOpen,
    color: 'text-purple-500 bg-purple-50',
    link: '/practice/reading',
    questions: 920
  },
  {
    id: 'listening',
    title: 'Listening Practice',
    description: 'Develop listening skills with authentic audio materials',
    icon: Headphones,
    color: 'text-orange-500 bg-orange-50',
    link: '/practice/listening',
    questions: 1100
  }
]

export default function PracticePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">PTE Practice Modules</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Master each section of the PTE exam with our comprehensive practice tools and AI-powered feedback
          </p>
        </div>

        {/* Practice Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {PRACTICE_SECTIONS.map((section, index) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setActiveSection(section.id)}
                onHoverEnd={() => setActiveSection(null)}
              >
                <Link href={section.link}>
                  <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${section.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant="secondary" className="mb-2">
                            {section.questions}+ questions
                          </Badge>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Additional Practice Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/pte/practice-new">
              <Card className="hover:shadow-md transition-shadow p-4 text-center">
                <h3 className="font-semibold">Practice Library</h3>
                <p className="text-sm text-muted-foreground mt-1">Browse all practice questions</p>
              </Card>
            </Link>
            <Link href="/pte/mock-tests">
              <Card className="hover:shadow-md transition-shadow p-4 text-center">
                <h3 className="font-semibold">Mock Tests</h3>
                <p className="text-sm text-muted-foreground mt-1">Full-length practice tests</p>
              </Card>
            </Link>
            <Link href="/pte/analytics">
              <Card className="hover:shadow-md transition-shadow p-4 text-center">
                <h3 className="font-semibold">Progress Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">Track your improvement</p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}