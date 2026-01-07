import React from 'react'

export default function WritingInput({ questionType, value, onChange, disabled }: any) {
    return (
        <div className="space-y-2">
            <textarea
                className="w-full min-h-[200px] border rounded p-4 font-mono text-base"
                placeholder="Write your response here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            <div className="text-right text-xs text-muted-foreground">
                Word count: {value.trim().split(/\s+/).filter(Boolean).length}
            </div>
        </div>
    )
}
