import React from 'react'

export default function ListeningInput({ questionType, question, value, onChange }: any) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Listening Input Placeholder</p>
            <textarea
                className="w-full border rounded p-2"
                placeholder="Type answer here..."
                value={value?.textAnswer || ''}
                onChange={(e) => onChange({ ...value, textAnswer: e.target.value })}
            />
        </div>
    )
}
