"use client";

import { useCallback, useRef, useState } from "react";

interface UseAudioRecorderOptions {
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}


export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        options.onRecordingComplete?.(blob);

        // Clean up stream
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to start recording");
      setError(error);
      options.onError?.(error);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
    setIsRecording(false);
  }, [audioUrl]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}