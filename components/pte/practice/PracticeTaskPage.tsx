'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PracticeSessionLayout } from '@/components/pte/practice/PracticeSessionLayout'
import { useAppStore } from '@/lib/store/app-store'
import { toast } from 'sonner'
import type { SpeakingScore } from '@/lib/types'

// Import specific components for different practice types
import { SpeakingQuestion } from '@/components/pte/practice/SpeakingQuestion'
import { WritingQuestion } from '@/components/pte/practice/WritingQuestion'
import { ReadingQuestion } from '@/components/pte/practice/ReadingQuestion'
import { ListeningQuestion } from '@/components/pte/practice/ListeningQuestion'

// Mock data imports
import { SPEAKING_TASKS as speakingTasks } from '@/lib/constants'

type PracticeType = 'speaking' | 'writing' | 'reading' | 'listening'

interface PracticeTaskPageProps {
  section: PracticeType
  questionType: string
}

export function PracticeTaskPage({ section, questionType }: PracticeTaskPageProps) {
  const params = useParams()
  const router = useRouter()
  const { user, checkRateLimit, incrementDailyUsage, initializeUser } = useAppStore()

  // For dynamic routes, we might also have an ID parameter
  const questionId = typeof params.id === 'string' ? params.id : undefined

  // State for practice session
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState<SpeakingScore | null>(null) // This will be more generic later
  const [isScoring, setIsScoring] = useState(false)

  // Initialize user on mount
  useEffect(() => {
    initializeUser()
  }, [initializeUser])

  // Get questions based on section and type
  const getQuestions = useCallback(async () => {
    try {
      // Fetch questions from API for all sections
      const response = await fetch(`/api/${section}/questions?type=${questionType}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section} questions`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${section} questions:`, error)
      return []
    }
  }, [section, questionType])

  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    getQuestions().then(setQuestions)
  }, [getQuestions])

  const currentQuestion = questions[currentQuestionIndex]

  const handleSubmit = async (answer: any) => {
    if (!user || !currentQuestion) return

    // Check rate limit
    if (!checkRateLimit()) {
      toast.error('Upgrade your plan for more practice questions.')
      return
    }

    setIsScoring(true)

    try {
      // Implementation will vary based on section type
      let response;
      if (section === 'speaking') {
        // Special handling for speaking (audio submission)
        // This will be implemented in the SpeakingQuestion component
        if (answer instanceof Blob) {
          const formData = new FormData()
          formData.append("file", answer, `recording-${Date.now()}.webm`)
          formData.append("type", questionType)
          formData.append("questionId", currentQuestion.id)
          formData.append("ext", "webm")

          const uploadResponse = await fetch("/api/uploads/audio", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload audio")
          }

          const { url } = await uploadResponse.json()

          response = await fetch("/api/speaking/attempts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionId: currentQuestion.id,
              type: questionType,
              audioUrl: url,
              durationMs: 30000, // TODO: Get actual duration from recorder
            }),
          })
        }
      } else {
        // General submission for other types
        response = await fetch(`/api/${section}/attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            type: questionType,
            answer: answer,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to submit ${section} attempt`)
      }

      const { attempt, feedback } = await response.json()

      // Use real scores from API response
      const practiceScore: SpeakingScore = {
        overall: attempt.overallScore || attempt.scores?.total || 0,
        content: attempt.contentScore || attempt.scores?.content || 0,
        pronunciation: attempt.pronunciationScore || attempt.scores?.pronunciation || 0,
        fluency: attempt.fluencyScore || attempt.scores?.fluency || 0,
        feedback: feedback || attempt.scores?.feedback || "AI analysis complete.",
        wordAnalysis: [],
      }

      setScore(practiceScore)
      incrementDailyUsage()
    } catch (error: any) {
      console.error("Submission error:", error)
      toast.error(error.message || `Failed to process your ${section} response. Please try again.`)
    } finally {
      setIsScoring(false)
    }
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
    setScore(null)
  }

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
    setScore(null)
  }

  // Render the appropriate component based on section
  const renderQuestionComponent = () => {
    if (!currentQuestion) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      )
    }

    switch (section) {
      case 'speaking':
        return (
          <SpeakingQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmit}
            isScoring={isScoring}
            score={score}
            onPrevious={handlePrevious}
            onNext={handleNext}
            questionId={questionId}
          />
        )
      case 'writing':
        return (
          <WritingQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmit}
            isScoring={isScoring}
            score={score}
            onPrevious={handlePrevious}
            onNext={handleNext}
            questionId={questionId}
          />
        )
      case 'reading':
        return (
          <ReadingQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmit}
            isScoring={isScoring}
            score={score}
            onPrevious={handlePrevious}
            onNext={handleNext}
            questionId={questionId}
          />
        )
      case 'listening':
        return (
          <ListeningQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmit}
            isScoring={isScoring}
            score={score}
            onPrevious={handlePrevious}
            onNext={handleNext}
            questionId={questionId}
          />
        )
      default:
        return (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Unsupported practice type: {section}</p>
          </div>
        )
    }
  }

  if (!currentQuestion && questions.length > 0) {
    return (
      <PracticeSessionLayout
        questionId={questionId || 'loading'}
        questionType={questionType}
        section={section}
        title={`Loading ${questionType.replace(/_/g, ' ')}...`}
      >
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </PracticeSessionLayout>
    )
  }

  if (!currentQuestion) {
    return (
      <PracticeSessionLayout
        questionId={questionId || 'unknown'}
        questionType={questionType}
        section={section}
        title={`Practice - ${questionType}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No questions found for {section} - {questionType}</p>
          </div>
        </div>
      </PracticeSessionLayout>
    )
  }

  return (
    <PracticeSessionLayout
      questionId={questionId || currentQuestion.id}
      questionType={questionType}
      section={section}
      title={`${questionType.replace(/_/g, ' ')} Question ${currentQuestionIndex + 1}`}
      difficulty={currentQuestion?.difficulty || 'Medium'}
    >
      {renderQuestionComponent()}
    </PracticeSessionLayout>
  )
}