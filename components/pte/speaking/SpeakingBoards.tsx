"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Pause, MessageSquare, ThumbsUp, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recording {
    id: string;
    userName: string;
    userAvatar?: string;
    score: number;
    maxScore: number;
    audioUrl?: string;
    createdAt: string;
    likes: number;
}

// Mock data for community recordings
const MOCK_RECORDINGS: Recording[] = [
    {
        id: "1",
        userName: "Sarah K.",
        score: 85,
        maxScore: 90,
        createdAt: "2 hours ago",
        likes: 12,
    },
    {
        id: "2",
        userName: "James L.",
        score: 72,
        maxScore: 90,
        createdAt: "5 hours ago",
        likes: 8,
    },
    {
        id: "3",
        userName: "Maria C.",
        score: 78,
        maxScore: 90,
        createdAt: "1 day ago",
        likes: 23,
    },
];

interface SpeakingBoardsProps {
    questionId: string;
    questionType: string;
}

export default function SpeakingBoards({ questionId, questionType }: SpeakingBoardsProps) {
    const [recordings] = useState<Recording[]>(MOCK_RECORDINGS);
    const [playingId, setPlayingId] = useState<string | null>(null);

    const getScoreColor = (score: number, max: number) => {
        const percentage = (score / max) * 100;
        if (percentage >= 70) return "text-emerald-500";
        if (percentage >= 50) return "text-amber-500";
        return "text-red-500";
    };

    const togglePlay = (id: string) => {
        setPlayingId(playingId === id ? null : id);
    };

    return (
        <div className="mt-8 border-t pt-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    Community Recordings
                </h3>
                <span className="text-sm text-muted-foreground">
                    {recordings.length} recordings
                </span>
            </div>

            {/* Recordings List */}
            <div className="space-y-3">
                {recordings.map((recording) => (
                    <div
                        key={recording.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        {/* Avatar */}
                        <Avatar className="size-10">
                            <AvatarImage src={recording.userAvatar} />
                            <AvatarFallback className="text-xs">
                                {recording.userName.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{recording.userName}</span>
                                <span className={cn(
                                    "text-sm font-bold",
                                    getScoreColor(recording.score, recording.maxScore)
                                )}>
                                    {recording.score}/{recording.maxScore}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{recording.createdAt}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => togglePlay(recording.id)}
                            >
                                {playingId === recording.id ? (
                                    <Pause className="size-4" />
                                ) : (
                                    <Play className="size-4" />
                                )}
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8">
                                <ThumbsUp className="size-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground min-w-[20px]">
                                {recording.likes}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center pt-2">
                Community recordings help you learn from other students.
            </p>
        </div>
    );
}
