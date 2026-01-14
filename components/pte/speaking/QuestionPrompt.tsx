"use client";
import React from "react";

export default function QuestionPrompt({ question }: { question: any }) {
    return (
        <div className="p-4 border rounded bg-muted/50">
            <h3 className="font-medium">{question.title}</h3>
            <p>{question.promptText}</p>
        </div>
    );
}
