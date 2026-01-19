"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Mic, Square } from "lucide-react";
import { type ComponentProps, useEffect } from "react";
import { useSpeechRecorder } from "@/hooks/useSpeechRecorder";

export type SpeakingRecorderProps = ComponentProps<typeof Button> & {
  onTranscriptionChange?: (text: string) => void;
  onSegmentUpdate?: (segments: Array<{ text: string; startSecond: number; endSecond: number }>) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  lang?: string;
  /** External control to stop recording (e.g. timer expired) */
  stopTrigger?: boolean;
};

export const SpeakingRecorder = ({
  className,
  onTranscriptionChange,
  onSegmentUpdate,
  onAudioRecorded,
  lang = "en-US",
  stopTrigger,
  ...props
}: SpeakingRecorderProps) => {
  const {
    isRecording,
    isProcessing,
    audioBlob,
    startRecording,
    stopRecording,
  } = useSpeechRecorder({
    lang,
    onTranscriptUpdate: onTranscriptionChange,
    onSegmentUpdate,
  });

  // Handle external stop trigger
  useEffect(() => {
    if (stopTrigger && isRecording) {
      stopRecording();
    }
  }, [stopTrigger, isRecording, stopRecording]);

  // Handle audio blob ready
  useEffect(() => {
    if (audioBlob && !isRecording) {
      onAudioRecorded(audioBlob);
    }
  }, [audioBlob, isRecording, onAudioRecorded]);

  const toggleListening = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Animated pulse rings */}
      {isRecording &&
        [0, 1, 2].map((index) => (
          <div
            className="absolute inset-0 animate-ping rounded-full border-2 border-red-400/30"
            key={index}
            style={{
              animationDelay: `${index * 0.3}s`,
              animationDuration: "2s",
            }}
          />
        ))}

      {/* Main record button */}
      <Button
        className={cn(
          "relative z-10 rounded-full transition-all duration-300 size-14",
          isRecording
            ? "bg-destructive text-white hover:bg-destructive/80 hover:text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground",
          className
        )}
        disabled={isProcessing}
        onClick={toggleListening}
        {...props}
      >
        {isProcessing ? (
          <Loader2 className="size-6 animate-spin" />
        ) : isRecording ? (
          <Square className="size-6" />
        ) : (
          <Mic className="size-6" />
        )}
      </Button>
    </div>
  );
};
