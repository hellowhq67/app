'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, PenTool, BookOpen, Headphones, ArrowRight, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { PracticeProvider } from '@/lib/store/practice-session'

// Mock Data for Categories
const SECTIONS = [
  { id: 'speaking', label: 'Speaking', icon: Mic, color: 'text-blue-500 bg-blue-50' },
  { id: 'writing', label: 'Writing', icon: PenTool, color: 'text-green-500 bg-green-50' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-purple-500 bg-purple-50' },
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-orange-500 bg-orange-50' },
]

const MOCK_TASKS = {
  speaking: [
    { id: 'ra', title: 'Read Aloud', count: 150, type: 'read_aloud' },
    { id: 'rs', title: 'Repeat Sentence', count: 200, type: 'repeat_sentence' },
    { id: 'di', title: 'Describe Image', count: 120, type: 'describe_image' },
    { id: 'rl', title: 'Retell Lecture', count: 80, type: 'retell_lecture' },
    { id: 'asq', title: 'Answer Short Question', count: 300, type: 'answer_short_question' },
  ],
  writing: [
    { id: 'swt', title: 'Summarize Written Text', count: 60, type: 'summarize_written_text' },
    { id: 'we', title: 'Write Essay', count: 40, type: 'write_essay' },
  ],
  reading: [
    { id: 'fib_rw', title: 'R&W Fill in Blanks', count: 100, type: 'reading_writing_fill_blanks' },
    { id: 'mcq_m', title: 'Multiple Choice (Multiple)', count: 80, type: 'multiple_choice_multiple' },
    { id: 'ro', title: 'Reorder Paragraphs', count: 70, type: 'reorder_paragraphs' },
    { id: 'fib_r', title: 'Fill in Blanks (Reading)', count: 90, type: 'fill_in_blanks' },
    { id: 'mcq_s', title: 'Multiple Choice (Single)', count: 60, type: 'multiple_choice_single' },
  ],
  listening: [
    { id: 'sst', title: 'Summarize Spoken Text', count: 50, type: 'summarize_spoken_text' },
    { id: 'mcq_lm', title: 'Multiple Choice (Multiple)', count: 60, type: 'multiple_choice_multiple' },
    { id: 'fib_l', title: 'Fill in Blanks', count: 70, type: 'fill_in_blanks' },
    { id: 'hcs', title: 'Highlight Correct Summary', count: 40, type: 'highlight_correct_summary' },
    { id: 'mcq_ls', title: 'Multiple Choice (Single)', count: 50, type: 'multiple_choice_single' },
    { id: 'smw', title: 'Select Missing Word', count: 45, type: 'select_missing_word' },
    { id: 'hiw', title: 'Highlight Incorrect Words', count: 55, type: 'highlight_incorrect_words' },
    { id: 'wfd', title: 'Write From Dictation', count: 120, type: 'write_from_dictation' },
  ],
}

export default function PracticeListingPage() {
  const [activeTab, setActiveTab] = useState('speaking')

  return (
    <PracticeProvider>
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Practice Library</h1>
            <p className="text-muted-foreground">Select a skill to start practicing with our AI-powered questions.</p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="h-16 w-full justify-start gap-4 bg-transparent p-0">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const isActive = activeTab === section.id

                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className={cn(
                      "flex-1 h-full max-w-[200px] gap-3 rounded-xl border transition-all data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:shadow-md",
                      !isActive && "border-transparent bg-white/50 hover:bg-white hover:border-gray-200"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", section.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-base">{section.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Content Area */}
            <div className="grid gap-6">
              {Object.entries(MOCK_TASKS).map(([key, tasks]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/pte/practice-new/${key}/${task.type}`}>
                          <Card className="group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-2 rounded-lg bg-gray-100 group-hover:bg-primary/10 transition-colors",
                                  key === 'speaking' ? 'text-blue-600' :
                                  key === 'writing' ? 'text-green-600' :
                                  key === 'reading' ? 'text-purple-600' : 'text-orange-600'
                                )}>
                                  {key === 'speaking' && <Mic className="w-6 h-6" />}
                                  {key === 'writing' && <PenTool className="w-6 h-6" />}
                                  {key === 'reading' && <BookOpen className="w-6 h-6" />}
                                  {key === 'listening' && <Headphones className="w-6 h-6" />}
                                </div>
                                <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-white transition-colors">
                                  {task.count} Questions
                                </Badge>
                              </div>

                              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {task.title}
                              </h3>

                              <div className="flex items-center text-sm text-muted-foreground mt-4 group-hover:translate-x-1 transition-transform">
                                Start Practice <ArrowRight className="w-4 h-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </PracticeProvider>
  )
}