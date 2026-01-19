"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Mic, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { useSpeechRecorder } from "@/hooks/useSpeechRecorder";

export interface SpeechInputProps extends ButtonProps {
  /**
   * Callback triggered when transcription changes (for Web Speech API).
   * Receives incremental transcript text.
   */
  onTranscriptionChange?: (text: string) => void;

  /**
   * Callback triggered when audio recording is completed.
   * Use this to send audio to a transcription service for browsers
   * that don't support Web Speech API (Firefox, Safari).
   * Should return the transcribed text.
   */
  onAudioRecorded?: (audioBlob: Blob) => Promise<string>;

  /**
   * Language code for speech recognition (e.g., "en-US")
   * @default "en-US"
   */
  lang?: string;

  /**
   * Maximum recording duration in seconds
   */
  maxDuration?: number;

  /**
   * Auto-stop recording after maxDuration
   * @default true
   */
  autoStop?: boolean;
}

export function SpeechInput({
  className,
  onTranscriptionChange,
  onAudioRecorded,
  lang = "en-US",
  maxDuration,
  autoStop = true,
  size = "default",
  variant = "default",
  ...props
}: SpeechInputProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    isRecording,
    isProcessing,
    supportsSpeechRecognition,
    transcript,
    audioBlob,
    startRecording,
    stopRecording,
    error,
  } = useSpeechRecorder({
    lang,
    onTranscriptUpdate: (text) => {
      onTranscriptionChange?.(text);
    },
  });

  // Handle recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop if maxDuration is reached
          if (maxDuration && autoStop && newTime >= maxDuration) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording, maxDuration, autoStop, stopRecording]);

  // Handle audio blob when recording stops (for browsers without Web Speech API)
  useEffect(() => {
    const handleAudioBlob = async () => {
      if (audioBlob && !isRecording && onAudioRecorded) {
        // Only use fallback transcription if Web Speech API is not supported
        if (!supportsSpeechRecognition) {
          setIsTranscribing(true);
          try {
            const transcribedText = await onAudioRecorded(audioBlob);
            onTranscriptionChange?.(transcribedText);
          } catch (err) {
            console.error("Transcription failed:", err);
          } finally {
            setIsTranscribing(false);
          }
        }
      }
    };
    handleAudioBlob();
  }, [audioBlob, isRecording, onAudioRecorded, onTranscriptionChange, supportsSpeechRecognition]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isLoading = isProcessing || isTranscribing;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Animated pulse rings when recording */}
      {isRecording &&
        [0, 1, 2].map((index) => (
          <div
            key={index}
            className="absolute inset-0 animate-ping rounded-full border-2 border-red-400/30"
            style={{
              animationDelay: `${index * 0.3}s`,
              animationDuration: "2s",
            }}
          />
        ))}

      <Button
        type="button"
        size={size}
        variant={variant}
        className={cn(
          "relative z-10 transition-all duration-300",
          size === "icon" ? "size-14 rounded-full" : "",
          isRecording
            ? "bg-destructive text-white hover:bg-destructive/80 hover:text-white"
            : "",
          className
        )}
        disabled={isLoading}
        onClick={toggleRecording}
        title={
          isRecording
            ? maxDuration
              ? `Recording (${recordingTime}s / ${maxDuration}s)`
              : `Recording (${recordingTime}s)`
            : "Start recording"
        }
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin", size === "icon" ? "size-6" : "size-4")} />
        ) : isRecording ? (
          <Square className={cn(size === "icon" ? "size-6" : "size-4")} />
        ) : (
          <Mic className={cn(size === "icon" ? "size-6" : "size-4")} />
        )}
        {size !== "icon" && (
          <span className="ml-2">
            {isLoading ? "Processing..." : isRecording ? "Stop" : "Record"}
          </span>
        )}
      </Button>

      {error && (
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-destructive whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
