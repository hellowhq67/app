"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HighlightIncorrectWordsProps {
    transcript: string; // The transcript text (with some words different from audio)
    value: number[] | null; // Array of word indices that user has selected
    onChange: (value: number[]) => void;
    disabled?: boolean;
}

/**
 * Component for "Highlight Incorrect Words" listening questions.
 * User clicks on words in the transcript that differ from the audio.
 */
export function HighlightIncorrectWords({
    transcript,
    value,
    onChange,
    disabled = false,
}: HighlightIncorrectWordsProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>(value || []);

    // Split transcript into words while preserving punctuation
    const words = transcript.split(/(\s+)/).filter(Boolean);

    // Filter to get only actual words (not whitespace)
    const wordEntries: Array<{ text: string; isWord: boolean; index: number }> = [];
    let wordIndex = 0;

    words.forEach((segment) => {
        if (/^\s+$/.test(segment)) {
            // It's whitespace
            wordEntries.push({ text: segment, isWord: false, index: -1 });
        } else {
            // It's a word (may include punctuation)
            wordEntries.push({ text: segment, isWord: true, index: wordIndex });
            wordIndex++;
        }
    });

    const totalWords = wordIndex;

    const toggleWord = (index: number) => {
        if (disabled) return;

        let newSelected: number[];
        if (selectedIndices.includes(index)) {
            newSelected = selectedIndices.filter((i) => i !== index);
        } else {
            newSelected = [...selectedIndices, index];
        }

        setSelectedIndices(newSelected);
        onChange(newSelected);
    };

    useEffect(() => {
        if (value) {
            setSelectedIndices(value);
        }
    }, [value]);

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
                Click on the words that are different from what you hear in the recording.
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border leading-loose text-lg select-none">
                {wordEntries.map((entry, idx) => {
                    if (!entry.isWord) {
                        // Render whitespace
                        return <span key={idx}>{entry.text}</span>;
                    }

                    const isSelected = selectedIndices.includes(entry.index);

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => toggleWord(entry.index)}
                            aria-pressed={isSelected}
                            disabled={disabled}
                            className={cn(
                                "inline appearance-none rounded border-0 bg-transparent px-0.5 py-0.5 transition-colors",
                                "hover:bg-yellow-200 dark:hover:bg-yellow-800/50",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isSelected && "bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 font-medium",
                                disabled && "cursor-not-allowed opacity-60"
                            )}
                        >
                            {entry.text}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total words: {totalWords}</span>
                <span>Words highlighted: {selectedIndices.length}</span>
            </div>

            {selectedIndices.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                        Highlighted:
                    </span>
                    {selectedIndices.sort((a, b) => a - b).map((index) => {
                        const word = wordEntries.find((e) => e.index === index);
                        return (
                            <span
                                key={index}
                                className="text-xs bg-yellow-200 dark:bg-yellow-700 px-2 py-1 rounded text-yellow-800 dark:text-yellow-200"
                            >
                                {word?.text}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
