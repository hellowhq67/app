'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle,
  Clock,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export interface MockTestQuestion {
  id: string
  title: string
  content: string
  type: string
  duration: number
}

export interface MockTestSection {
  name: string
  questions: MockTestQuestion[]
}

export interface MockTest {
  id: string
  title: string
  duration: number
  sections: MockTestSection[]
  status?: string
}

interface MockTestSimulatorProps {
  mockTest: MockTest
}

export default function MockTestSimulator({
  mockTest,
}: MockTestSimulatorProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  type TestStatus = 'not-started' | 'in-progress' | 'completed'
  const coerceStatus = (s: unknown): TestStatus =>
    s === 'not-started' || s === 'in-progress' || s === 'completed'
      ? (s as TestStatus)
      : 'not-started'
  const [testStatus, setTestStatus] = useState<TestStatus>(
    coerceStatus((mockTest as { status?: unknown })?.status)
  )
  const [audioPlaying, setAudioPlaying] = useState(false)

  const currentSection = mockTest.sections[currentSectionIndex]
  const currentQuestion = currentSection?.questions[currentQuestionIndex]

  // Next-question controller (memoized for effect deps)
  const handleNextQuestion = useCallback(() => {
    if (!currentSection) return
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1
      setCurrentQuestionIndex((prev) => prev + 1)
      if (testStatus === 'in-progress') {
        const nextQ = currentSection.questions[nextIdx]
        setTimeRemaining(nextQ?.duration ?? 0)
      }
    } else if (currentSectionIndex < mockTest.sections.length - 1) {
      const nextSectionIdx = currentSectionIndex + 1
      const firstQ = mockTest.sections[nextSectionIdx]?.questions[0]
      setCurrentSectionIndex((prev) => prev + 1)
      setCurrentQuestionIndex(0)
      if (testStatus === 'in-progress') {
        setTimeRemaining(firstQ?.duration ?? 0)
      }
    } else {
      // Test completed
      setTestStatus('completed')
    }
  }, [
    currentSection,
    currentQuestionIndex,
    currentSectionIndex,
    testStatus,
    mockTest.sections,
  ])

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (testStatus === 'in-progress' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleNextQuestion()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timeRemaining, testStatus, handleNextQuestion])

  const startTest = () => {
    setTestStatus('in-progress')
    setTimeRemaining(currentQuestion?.duration || 0)
  }

  const handlePreviousQuestion = useCallback(() => {
    if (!currentSection) return
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1
      setCurrentQuestionIndex((prev) => prev - 1)
      if (testStatus === 'in-progress') {
        const prevQ = currentSection.questions[prevIdx]
        setTimeRemaining(prevQ?.duration ?? 0)
      }
    } else if (currentSectionIndex > 0) {
      const prevSection = mockTest.sections[currentSectionIndex - 1]
      const lastIdx = Math.max(0, (prevSection?.questions.length ?? 1) - 1)
      setCurrentSectionIndex((prev) => prev - 1)
      setCurrentQuestionIndex(lastIdx)
      if (testStatus === 'in-progress') {
        const lastQ = prevSection?.questions[lastIdx]
        setTimeRemaining(lastQ?.duration ?? 0)
      }
    }
  }, [
    currentSection,
    currentQuestionIndex,
    currentSectionIndex,
    testStatus,
    mockTest.sections,
  ])

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const playAudio = () => {
    setAudioPlaying(true)
    // Simulate audio playback
    setTimeout(() => setAudioPlaying(false), 2000)
  }

  if (testStatus === 'not-started') {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">PTE Academic Mock Test</CardTitle>
            <CardDescription>
              Prepare for your PTE exam with this full-length practice test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {mockTest.sections.length}
                </div>
                <div className="text-sm text-gray-500">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {mockTest.sections.reduce(
                    (acc, section) => acc + section.questions.length,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {mockTest.duration}
                </div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">PTE</div>
                <div className="text-sm text-gray-500">Academic</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Test Sections:</h3>
              <div className="grid grid-cols-2 gap-2">
                {mockTest.sections.map((section, idx) => (
                  <Badge key={idx} variant="secondary" className="py-2">
                    {section.name} ({section.questions.length} questions)
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="mx-auto w-full max-w-sm"
              onClick={startTest}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Mock Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Test Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mockTest.title}</h1>
          <div className="mt-1 flex items-center gap-4">
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {Math.floor(timeRemaining / 60)}:
              {String(timeRemaining % 60).padStart(2, '0')}
            </Badge>
            <Badge variant="outline">
              {currentSectionIndex + 1}/{mockTest.sections.length} Sections
            </Badge>
            <Badge variant="outline">
              {currentQuestionIndex + 1}/{currentSection.questions.length}{' '}
              Questions
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Review
          </Button>
          <Button variant="outline" size="sm">
            <Square className="mr-2 h-4 w-4" />
            Exit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{currentSection.name}</span>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1}/{currentSection.questions.length}
            </span>
          </div>
          <Progress
            value={
              ((currentQuestionIndex + 1) / currentSection.questions.length) *
              100
            }
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{currentQuestion?.type}</Badge>
                  <CardTitle>{currentQuestion?.title}</CardTitle>
                </div>
                <Badge variant="outline">
                  {Math.floor(timeRemaining / 60)}:
                  {String(timeRemaining % 60).padStart(2, '0')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700">{currentQuestion?.content}</p>

                {/* Question-specific UI based on type */}
                {currentQuestion?.type.includes('Read Aloud') && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-lg leading-relaxed">
                      The Australian government has announced a new initiative
                      to improve education outcomes across the country. This
                      comprehensive plan focuses on enhancing digital literacy,
                      promoting STEM education, and providing better support for
                      students from disadvantaged backgrounds.
                    </p>
                  </div>
                )}

                {currentQuestion?.type.includes('Repeat Sentence') && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-100">
                      <span className="text-gray-500">Audio Content</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={playAudio}
                      disabled={audioPlaying}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      {audioPlaying ? 'Playing...' : 'Listen'}
                    </Button>
                  </div>
                )}

                {currentQuestion?.type.includes('Describe Image') && (
                  <div className="flex flex-col items-center">
                    <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                      <span className="text-gray-500">Question Image</span>
                    </div>
                    <p className="mt-4 text-center text-gray-600">
                      Describe the image in detail.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={
                      currentQuestionIndex === 0 && currentSectionIndex === 0
                    }
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline">Mark for Review</Button>
                    <Button onClick={handleNextQuestion}>
                      {currentQuestionIndex ===
                        currentSection.questions.length - 1
                        ? 'Next Section'
                        : 'Next Question'}
                    </Button>
                  </div>
                </div>

                {/* Recording Controls */}
                {(currentQuestion?.type.includes('Read Aloud') ||
                  currentQuestion?.type.includes('Repeat Sentence') ||
                  currentQuestion?.type.includes('Describe Image')) && (
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={toggleRecording}
                        variant={isRecording ? 'destructive' : 'default'}
                        size="lg"
                      >
                        <Mic
                          className={`mr-2 h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`}
                        />
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={currentSection.name}
                onValueChange={(value) => {
                  const sectionIndex = mockTest.sections.findIndex(
                    (s) => s.name === value
                  )
                  if (sectionIndex !== -1) {
                    setCurrentSectionIndex(sectionIndex)
                    setCurrentQuestionIndex(0)
                    if (testStatus === 'in-progress') {
                      const firstQ =
                        mockTest.sections[sectionIndex]?.questions[0]
                      setTimeRemaining(firstQ?.duration ?? 0)
                    }
                  }
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  {mockTest.sections.map((section, idx) => (
                    <TabsTrigger
                      key={idx}
                      value={section.name}
                      className={
                        currentSectionIndex === idx
                          ? 'bg-primary text-white'
                          : ''
                      }
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs">
                          {section.name.substring(0, 3)}
                        </span>
                        <span className="text-xs">
                          {section.questions.length}
                        </span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {mockTest.sections.map((section, sectionIdx) => (
                  <TabsContent
                    key={sectionIdx}
                    value={section.name}
                    className="space-y-2"
                  >
                    <div className="mb-2 text-sm font-medium">
                      {section.name} Questions
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {section.questions.map((_, qIdx) => (
                        <Button
                          key={qIdx}
                          size="sm"
                          variant={
                            sectionIdx === currentSectionIndex &&
                              qIdx === currentQuestionIndex
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => {
                            setCurrentSectionIndex(sectionIdx)
                            setCurrentQuestionIndex(qIdx)
                          }}
                        >
                          {qIdx + 1}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
