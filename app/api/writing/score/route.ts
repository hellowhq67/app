import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { QuestionType } from '@/lib/types'
import { submitWritingAttempt } from '@/lib/actions/ai-writing-score'

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { questionId, questionText, answer, timeTaken } = await request.json()

    if (!questionId || !answer) {
      return NextResponse.json({ error: 'Question ID and answer are required' }, { status: 400 })
    }

    const attempt = await submitWritingAttempt({
      userId: session.user.id,
      questionId,
      questionText: questionText || '',
      userAnswer: answer,
      timeTaken,
    })

    return NextResponse.json(attempt.scores)
  } catch (error: any) {
    console.error('AI Writing Analysis Error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI score.', details: error.message },
      { status: 500 }
    )
  }
}
