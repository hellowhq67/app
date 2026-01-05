"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypingEffectProps {
    text: string;
    speed?: number;
    className?: string;
    delay?: number;
}

export function TypingEffect({
    text,
    speed = 30,
    className,
    delay = 0,
}: TypingEffectProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasStarted(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!hasStarted) return;

        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed, hasStarted]);

    return (
        <div className={cn("font-medium leading-relaxed text-gray-700", className)}>
            {displayedText}
            {currentIndex < text.length && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
            )}
        </div>
    );
}
