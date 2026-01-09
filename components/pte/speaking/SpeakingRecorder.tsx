"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function SpeakingRecorder(props: any) {
    return (
        <div className="flex flex-col gap-2 border p-4 rounded items-center justify-center bg-muted/20">
            <span className="text-sm text-muted-foreground">Recorder Placeholder</span>
            <Button
                variant="secondary"
                onClick={() =>
                    props.onRecorded &&
                    props.onRecorded({ blob: new Blob([]), durationMs: 2000, timings: { prepMs: 0, answerMs: 2000 } })
                }
            >
                Simulate Recording
            </Button>
        </div>
    );
}
