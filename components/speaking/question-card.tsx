"use client"
//gemin modife it as dayanamice qustion card 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { SpeakingQuestion } from "@/lib/db/schema"
import type { SpeakingType } from "@/lib/types"
import Image from "next/image"

interface SpeakingTask {
  title: string
  instructions: string
  type: SpeakingType
}

interface QuestionCardProps {
  task: SpeakingTask
  question: SpeakingQuestion
  questionNumber: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onBookmark: () => void
  isBookmarked?: boolean
}

export function QuestionCard({
  task,
  question,
  questionNumber,
  totalQuestions,
  onPrevious,
  onNext,
  onBookmark,
  isBookmarked = false,
}: QuestionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "Hard":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Extract content from question based on available fields
  const getQuestionContent = () => {
    if (question.promptText) {
      return question.promptText
    }
    if (question.metadata && typeof question.metadata === 'object' && question.metadata !== null) {
      const meta = question.metadata as any
      return meta.content || meta.prompt || ''
    }
    return ''
  }

  // Extract image URL from available sources
  const getImageUrl = () => {
    if (question.promptMediaUrl) {
      return question.promptMediaUrl
    }
    if (question.metadata && typeof question.metadata === 'object' && question.metadata !== null) {
      const meta = question.metadata as any
      return meta.imageUrl || null
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{task.title} Practice</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{task.instructions}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onBookmark} className={isBookmarked ? "text-amber-500" : ""}>
            <Bookmark className={isBookmarked ? "fill-current" : ""} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            #{question.id.split("-")[1]} {Array.isArray(question.tags) ? question.tags[0] : ''}
          </span>
          <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>

        {/* Question Content */}
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          {getImageUrl() ? (
            <div className="space-y-4">
              <Image
                src={getImageUrl() || "/placeholder.svg"}
                alt="Question image"
                width={600}
                height={400}
                className="rounded-lg w-full object-contain"
              />
              <p className="text-center text-sm text-muted-foreground">{getQuestionContent()}</p>
            </div>
          ) : (
            <p className="text-lg leading-relaxed">{getQuestionContent()}</p>
          )}
        </div>


      </CardContent>
    </Card>
  )
}