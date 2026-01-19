"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

import type { TranscriptionSegment as ImportedTranscriptionSegment } from "@/hooks/useSpeechRecorder";

// Type alias for the transcription segment data structure
export type TranscriptionSegmentType = ImportedTranscriptionSegment;

interface TranscriptionProps {
    children: (segment: TranscriptionSegmentType, index: number) => React.ReactNode;
    currentTime: number;
    onSeek: (time: number) => void;
    segments: TranscriptionSegmentType[];
}

export const Transcription = ({
    children,
    currentTime,
    onSeek,
    segments,
}: TranscriptionProps) => {
    return (
        <div className="flex flex-wrap gap-1 leading-relaxed">
            {segments.map((segment, index) => {
                const isActive =
                    currentTime >= segment.startSecond && currentTime < segment.endSecond;
                return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <span
                        key={`${segment.startSecond}-${segment.endSecond}`}
                        className={cn(
                            "cursor-pointer transition-colors duration-200 rounded px-0.5",
                            isActive
                                ? "bg-primary/20 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => onSeek(segment.startSecond)}
                    >
                        {children(segment, index)}
                    </span>
                );
            })}
        </div>
    );
};

interface TranscriptionSegmentProps extends React.HTMLAttributes<HTMLSpanElement> {
    segment: TranscriptionSegmentType;
    index: number;
}

export const TranscriptionSegment = React.forwardRef<
    HTMLSpanElement,
    TranscriptionSegmentProps
>(({ className, segment, ...props }, ref) => {
    return (
        <span ref={ref} className={cn("", className)} {...props}>
            {segment.text}
        </span>
    );
});
TranscriptionSegment.displayName = "TranscriptionSegment";
