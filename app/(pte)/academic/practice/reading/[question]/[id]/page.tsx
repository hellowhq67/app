import { db } from '@/lib/db/drizzle'
import { pteQuestions, pteReadingQuestions, pteQuestionTypes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ReadingPracticeClient from '@/components/pte/reading/ReadingPracticeClient'

// Force dynamic since we're fetching individual question data that might change
export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        question: string
        id: string
    }>
}

export default async function ReadingPracticePage({ params }: PageProps) {
    const { id } = await params

    // Fetch question with reading details and type info
    // Using query builder's 'with' relation if set up, or manual join.
    // The schema has relations set up: pteQuestionsRelations has 'reading' and 'questionType'.

    const question = await db.query.pteQuestions.findFirst({
        where: eq(pteQuestions.id, id),
        with: {
            reading: true,
            questionType: true
        }
    })

    if (!question || !question.reading || !question.questionType) {
        return notFound()
    }

    return <ReadingPracticeClient question={question as any} />
}
