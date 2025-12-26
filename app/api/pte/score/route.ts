import { NextRequest, NextResponse } from 'next/server'
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent'
import { QuestionType } from '@/lib/types'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { pteQuestions } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
    try {
        const { type, questionId, submission } = await req.json()

        if (!type || !questionId) {
            return NextResponse.json({ success: false, error: 'Missing type or questionId' }, { status: 400 })
        }

        // Fetch the question details from DB to get the answer key/content
        const question = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, questionId)
        })

        if (!question) {
            return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
        }

        const questionType = type as QuestionType

        // Determine input type
        const agentSubmission = {
            text: submission.textAnswer || submission.userTranscript,
            audioUrl: submission.audioRecordingUrl
        };

        // Use the new Orchestration Agent (V2)
        const feedback = await scorePteAttemptV2(questionType, {
            questionContent: question.content || question.title,
            submission: agentSubmission
        })

        return NextResponse.json({ success: true, data: feedback })

    } catch (error: any) {
        console.error('Scoring API Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
