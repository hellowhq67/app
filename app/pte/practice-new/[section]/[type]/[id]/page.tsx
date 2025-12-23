'use client'

import { useParams } from 'next/navigation'
import { PracticeTaskPage } from '@/components/pte/practice/PracticeTaskPage'

export default function SingleQuestionPage() {
  const params = useParams()
  const { section, type, id } = params as { section: string; type: string; id: string }

  // Convert section to the appropriate type
  const practiceSection: 'speaking' | 'writing' | 'reading' | 'listening' = 
    section === 'speaking' || section === 'writing' || section === 'reading' || section === 'listening'
      ? section
      : 'speaking' // fallback

  return (
    <PracticeTaskPage
      section={practiceSection}
      questionType={type}
    />
  )
}