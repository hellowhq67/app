"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ListeningFillBlanksProps {
    transcript: string; // Text with blanks marked as _____ or [BLANK] or numbered {1}, {2}
    value: Record<string, string> | null;
    onChange: (value: Record<string, string>) => void;
    disabled?: boolean;
}

/**
 * Component for "Fill in the Blanks" listening questions.
 * Displays transcript with input fields where blanks are marked.
 */
export function ListeningFillBlanks({
    transcript,
    value,
    onChange,
    disabled = false,
}: ListeningFillBlanksProps) {
    const [answers, setAnswers] = useState<Record<string, string>>(value || {});

    // Parse transcript to find blanks
    // Supports: _____, [BLANK], {1}, {2}, etc.
    const parseTranscript = (text: string) => {
        const parts: Array<{ type: "text" | "blank"; content: string; index?: number }> = [];
        let blankIndex = 0;

        // Split by blank markers
        const regex = /(_____+|\[BLANK\]|\{\d+\})/gi;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Add text before the blank
            if (match.index > lastIndex) {
                parts.push({
                    type: "text",
                    content: text.slice(lastIndex, match.index),
                });
            }

            // Add the blank
            parts.push({
                type: "blank",
                content: match[0],
                index: blankIndex,
            });
            blankIndex++;

            lastIndex = regex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push({
                type: "text",
                content: text.slice(lastIndex),
            });
        }

        return parts;
    };

    const parts = parseTranscript(transcript);
    const blankCount = parts.filter((p) => p.type === "blank").length;

    const handleInputChange = (index: number, inputValue: string) => {
        const newAnswers = {
            ...answers,
            [index.toString()]: inputValue,
        };
        setAnswers(newAnswers);
        onChange(newAnswers);
    };

    useEffect(() => {
        if (value) {
            setAnswers(value);
        }
    }, [value]);

    return (
        <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
                Fill in the {blankCount} blank{blankCount !== 1 ? "s" : ""} as you listen to the recording.
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border leading-relaxed text-lg">
                {parts.map((part, idx) => {
                    if (part.type === "text") {
                        return (
                            <span key={idx} className="text-foreground">
                                {part.content}
                            </span>
                        );
                    }

                    // Render input for blank
                    const blankIndex = part.index!;
                    const inputValue = answers[blankIndex.toString()] || "";

                    return (
                        <span key={idx} className="inline-block mx-1 align-middle">
                            <Input
                                type="text"
                                value={inputValue}
                                onChange={(e) => handleInputChange(blankIndex, e.target.value)}
                                disabled={disabled}
                                placeholder={`(${blankIndex + 1})`}
                                className={cn(
                                    "w-32 h-8 text-center inline-block",
                                    "border-b-2 border-t-0 border-l-0 border-r-0 rounded-none",
                                    "bg-transparent focus:bg-white dark:focus:bg-slate-800",
                                    "focus:border-primary",
                                    inputValue ? "border-green-500" : "border-slate-400"
                                )}
                            />
                        </span>
                    );
                })}
            </div>

            <div className="text-xs text-muted-foreground">
                Answered: {Object.values(answers).filter(Boolean).length} / {blankCount}
            </div>
        </div>
    );
}
