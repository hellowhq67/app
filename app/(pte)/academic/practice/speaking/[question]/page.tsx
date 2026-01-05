import { getPracticeQuestions } from '@/lib/pte/practice'
import { redirect } from 'next/navigation'

export default async function SpeakingTypePage({ params }: { params: { question: string } }) {
    // 1. Fetch questions for this type
    const questions = await getPracticeQuestions(params.question, 1, 1)

    // 2. If questions exist, redirect to the first one
    if (questions && questions.length > 0) {
        redirect(`/academic/practice/speaking/${params.question}/${questions[0].id}`)
    }

    // 3. Fallback
    return (
        <div className="container mx-auto p-12 text-center">
            <h1 className="text-xl font-bold">No questions available yet.</h1>
            <p className="text-muted-foreground">We are adding new questions daily. Please check back later.</p>
        </div>
    )
}
