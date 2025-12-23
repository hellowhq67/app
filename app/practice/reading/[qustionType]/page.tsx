"use client"

import { useParams } from "next/navigation"
import { PracticeTaskPage } from "@/components/pte/practice/PracticeTaskPage"

export default function ReadingTaskPage() {
  const params = useParams()
  const questionType = params.questionType as string

  return (
    <PracticeTaskPage 
      section="reading" 
      questionType={questionType} 
    />
  )
}