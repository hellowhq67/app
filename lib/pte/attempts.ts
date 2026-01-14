import { TestSection, QuestionType, AnswerData, SpeakingTimings } from '@/lib/types'

export interface StartSessionResponse {
    id: string
    token: string
    startAt: number
    endAt: number
}

interface AttemptContext {
    token: string
    questionId: string
    type: string
    userResponse: any
    timeTaken: number
    timings: SpeakingTimings
}

export function getDefaultTimings(section: string, questionType?: string) {
    // Default timings based on section usually
    // This is a simplified fallback
    return {
        prepMs: 0,
        answerMs: 120000 // 2 minutes default
    }
}

export async function startValidatedItemSession({
    section,
    questionType,
    questionId,
    prepMs,
    answerMs,
}: {
    section: string
    questionType?: string
    questionId: string
    prepMs: number
    answerMs: number
}): Promise<StartSessionResponse> {
    const res = await fetch('/api/pte/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            section,
            questionType,
            questionId,
            prepMs,
            answerMs,
        }),
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || 'Failed to start session')
    }

    return res.json()
}

export async function submitReadingAttempt(data: {
    token: string
    questionId: string
    type: string
    userResponse: AnswerData
    timeTaken: number
    timings: SpeakingTimings
}) {
    return fetch('/api/reading/attempts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-session-token': data.token,
        },
        body: JSON.stringify(data),
    })
}

export async function submitListeningAttempt(data: any) {
    return fetch('/api/listening/attempts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-session-token': data.token,
        },
        body: JSON.stringify(data),
    })
}

export async function submitWritingAttempt(data: any) {
    return fetch('/api/writing/attempts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-session-token': data.token,
        },
        body: JSON.stringify(data),
    })
}

// Queue / Offline logic placeholder
export function initQueueAutoRetry() {
    if (typeof window === 'undefined') return
    console.log('[Attempts] Offline queue initialized')
}

export function enqueueSubmission(data: {
    url: string
    method: string
    headers: Record<string, string>
    body: any
}) {
    console.warn('[Attempts] Enqueuing submission (offline mode not fully implemented)', data)
    // Logic would go here to save to IndexedDB/localStorage
}
