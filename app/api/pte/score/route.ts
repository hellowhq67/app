import { NextRequest, NextResponse } from 'next/server'
import { scorePteAttempt } from '@/lib/ai/scoring'
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

        // Hybrid Scoring Logic
        const isSubjective = [
            QuestionType.READ_ALOUD,
            QuestionType.REPEAT_SENTENCE,
            QuestionType.DESCRIBE_IMAGE,
            QuestionType.RE_TELL_LECTURE,
            QuestionType.ANSWER_SHORT_QUESTION,
            QuestionType.RESPOND_TO_A_SITUATION,
            QuestionType.SUMMARIZE_GROUP_DISCUSSION,
            QuestionType.SUMMARIZE_WRITTEN_TEXT,
            QuestionType.WRITE_ESSAY,
            QuestionType.SUMMARIZE_SPOKEN_TEXT
        ].includes(questionType)

        if (isSubjective) {
            // AI-Based Scoring
            const feedback = await scorePteAttempt(questionType, {
                promptTopic: question.title,
                originalText: question.content,
                userInput: submission.textAnswer || submission.userTranscript,
                questionText: question.content,
                userTranscript: submission.userTranscript,
                audioTranscript: question.questionData?.transcript,
                // ... pass other relevant params
            })

            return NextResponse.json({ success: true, data: feedback })
        } else {
            // Rule-Based Scoring (Objective)
            // This is a simplified rule-based engine. 
            // In a real app, you'd compare against question.answerKey

            const score = calculateObjectiveScore(questionType, submission, question.questionData?.answerKey)

            return NextResponse.json({
                success: true,
                data: {
                    overallScore: score,
                    accuracy: { score, feedback: score > 0 ? "Correct!" : "Incorrect." },
                    suggestions: score < 100 ? ["Review the grammar rules for this question type."] : ["Perfect score!"],
                    strengths: score > 50 ? ["Good understanding of the context."] : [],
                    areasForImprovement: score < 100 ? ["Try focusing on specific keywords."] : []
                }
            })
        }

    } catch (error: any) {
        console.error('Scoring API Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

function calculateObjectiveScore(type: QuestionType, submission: any, answerKey: any): number {
    // Skeleton for rule-based matching
    // Real implementation would use the answerKey stored in JSON in DB
    if (!answerKey) return 0;

    // Logic varies by type (FIB, MCQ, RO)
    // For now, return a placeholder
    return 85;
}
