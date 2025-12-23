"use client"

import { useParams } from "next/navigation"
import { PracticeTaskPage } from "@/components/pte/practice/PracticeTaskPage"

export default function WritingTaskPage() {
  const params = useParams()
  const questionType = params.questionType as string

  return (
    <PracticeTaskPage 
      section="writing" 
      questionType={questionType} 
    />
  )
}