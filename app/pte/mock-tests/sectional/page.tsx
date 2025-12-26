'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Mic,
  PenSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SectionalMockTestsPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'all')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Mock data - replace with actual database queries
  const sectionTests = {
    listening: [
      {
        id: '21a',
        name: 'Listening Section Test 21A [7th Aug, New Format]',
        questions: 38,
        duration: '1 hr 3 min',
        attempts: 11406,
      },
      {
        id: '19a',
        name: 'Listening Section Test 19A',
        questions: 34,
        duration: '1 hr 3 min',
        attempts: 11575,
      },
      {
        id: '20a',
        name: 'Listening Section Test 20A',
        questions: 34,
        duration: '1 hr 3 min',
        attempts: 11732,
      },
      {
        id: '18a',
        name: 'Listening Section Test 18A',
        questions: 34,
        duration: '1 hr 3 min',
        attempts: 11129,
      },
      {
        id: '17a',
        name: 'Listening Section Test 17A',
        questions: 34,
        duration: '1 hr 3 min',
        attempts: 10717,
      },
      {
        id: '8a',
        name: 'Listening Section Test 8A',
        questions: 34,
        duration: '1 hr 3 min',
        attempts: 11422,
      },
      {
        id: '4a',
        name: 'Listening Section Test 4A',
        questions: 34,
        duration: '1 hr 3 min',
        attempts: 10532,
      },
    ],
    speaking: [
      {
        id: 's21a',
        name: 'Speaking Section Test 21A [7th Aug, New Format]',
        questions: 6,
        duration: '18 min',
        attempts: 8234,
      },
      {
        id: 's19a',
        name: 'Speaking Section Test 19A',
        questions: 6,
        duration: '18 min',
        attempts: 8567,
      },
      {
        id: 's20a',
        name: 'Speaking Section Test 20A',
        questions: 6,
        duration: '18 min',
        attempts: 8123,
      },
    ],
    writing: [
      {
        id: 'w21a',
        name: 'Writing Section Test 21A [7th Aug, New Format]',
        questions: 2,
        duration: '41 min',
        attempts: 6532,
      },
      {
        id: 'w19a',
        name: 'Writing Section Test 19A',
        questions: 2,
        duration: '41 min',
        attempts: 6234,
      },
    ],
    reading: [
      {
        id: 'r21a',
        name: 'Reading Section Test 21A [7th Aug, New Format]',
        questions: 15,
        duration: '32 min',
        attempts: 7234,
      },
      {
        id: 'r19a',
        name: 'Reading Section Test 19A',
        questions: 15,
        duration: '32 min',
        attempts: 7567,
      },
    ],
  }

  const allTests = [
    ...sectionTests.listening,
    ...sectionTests.speaking,
    ...sectionTests.writing,
    ...sectionTests.reading,
  ].sort((a, b) => b.attempts - a.attempts)

  const getTestsForTab = () => {
    if (activeTab === 'all') return allTests
    if (activeTab === 'speaking') return sectionTests.speaking
    if (activeTab === 'writing') return sectionTests.writing
    if (activeTab === 'reading') return sectionTests.reading
    if (activeTab === 'listening') return sectionTests.listening
    return allTests
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/pte/dashboard" className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/pte/mock-tests" className="hover:text-blue-600">
              Mock Test
            </Link>
            <span>/</span>
            <span className="text-gray-900">Academic</span>
            <span>/</span>
            <span className="font-medium text-gray-900">Sectional Test</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Free PTE Section Mock Tests Online
              </h1>
              <p className="max-w-3xl text-gray-600">
                Focus on specific sections of the PTE exam with our section mock
                tests. Practice Speaking, Writing, Reading, and Listening to
                boost your skills and prepare for the real exam. These free PTE
                section mock tests online come with scores and answers for
                detailed feedback.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Community Support
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2">
          <Button asChild variant="outline">
            <Link href="/pte/mock-tests">Full Tests</Link>
          </Button>
          <Button asChild variant="default">
            <Link href="/pte/mock-tests/sectional">Section Tests</Link>
          </Button>
        </div>

        {/* Section Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="speaking" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Speaking
            </TabsTrigger>
            <TabsTrigger value="writing" className="flex items-center gap-2">
              <PenSquare className="h-4 w-4" />
              Writing
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="listening" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Listening
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {getTestsForTab().map((test, index) => (
              <Card key={test.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-medium text-gray-500">
                          {index + 1}.
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {test.name}
                        </h3>
                      </div>
                      <div className="ml-7 flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{test.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{test.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{test.attempts.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="border-orange-200 bg-orange-50 text-orange-700"
                      >
                        VIP
                      </Badge>
                      <Button asChild>
                        <Link href={`/pte/mock-tests/sectional/${test.id}`}>
                          Start Test
                          <span className="ml-1">→</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">
                Section Test Benefits
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Focus on one section at a time</li>
                <li>• Shorter duration than full tests</li>
                <li>• Perfect for targeted practice</li>
                <li>• Identify section-specific weaknesses</li>
                <li>• Ideal for skill building</li>
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Section Duration</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Speaking: ~18-20 minutes</li>
                <li>• Writing: ~32-41 minutes</li>
                <li>• Reading: ~29-32 minutes</li>
                <li>• Listening: ~30-45 minutes</li>
                <li>• Flexible practice schedule</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
