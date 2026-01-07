import React from 'react'

export default function QuestionPrompt({ question }: { question: any }) {
    return (
        <div className="space-y-2">
            <h3 className="font-semibold">{question.title}</h3>
            <p>{question.promptText}</p>
        </div>
    )
}
