"use client"

import { useParams } from "next/navigation"
import { PracticeTaskPage } from "@/components/pte/practice/PracticeTaskPage"

export default function SpeakingTaskPage() {
  const params = useParams()
  const taskType = params.questionType as string

  return (
    <PracticeTaskPage 
      section="speaking" 
      questionType={taskType} 
    />
  )
}