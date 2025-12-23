"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Play, Pause, RotateCcw, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioRecorderProps {
  prepTime: number
  recordTime: number
  onRecordingComplete: (audioBlob: Blob) => void
  onSubmit: () => void
  isDisabled?: boolean
}

export function AudioRecorder({
  prepTime,
  recordTime,
  onRecordingComplete,
  onSubmit,
  isDisabled = false,
}: AudioRecorderProps) {
  const [status, setStatus] = useState<"idle" | "preparing" | "recording" | "recorded">("idle")
  const [prepTimeLeft, setPrepTimeLeft] = useState(prepTime)
  const [recordTimeLeft, setRecordTimeLeft] = useState(recordTime)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(0.1))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  // Define callbacks first to avoid hoisting issues

  const updateWaveform = useCallback(() => {
    if (analyserRef.current && status === "recording") {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)

      const normalized = Array.from(dataArray.slice(0, 50)).map((v) => v / 255)
      setWaveformData(normalized)

      // Use a reference to the function for the next frame
      // This works because the function reference inside the closure is to the variable
      animationRef.current = requestAnimationFrame(updateWaveform)
    }
  }, [status]) // Recursively calls itself via requestAnimationFrame

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop()
      setStatus("recorded")
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setWaveformData(Array(50).fill(0.1))
    }
  }, [status])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setStatus("recording")
      
      // Start visualization
      updateWaveform()
    } catch (err) {
      console.error("Error accessing microphone:", err)
    }
  }, [onRecordingComplete, updateWaveform])

  // Prep timer
  useEffect(() => {
    if (status === "preparing" && prepTimeLeft > 0) {
      const timer = setTimeout(() => setPrepTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (status === "preparing" && prepTimeLeft === 0) {
      startRecording()
    }
  }, [status, prepTimeLeft, startRecording])

  // Record timer
  useEffect(() => {
    if (status === "recording" && recordTimeLeft > 0) {
      const timer = setTimeout(() => setRecordTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (status === "recording" && recordTimeLeft === 0) {
      stopRecording()
    }
  }, [status, recordTimeLeft, stopRecording])

  // Watch for status changes to trigger waveform updates (if not started by startRecording)
  // Actually startRecording calls updateWaveform, but if status changes mid-flight...
  // The updateWaveform depends on status. If status changes, updateWaveform is new.
  // But requestAnimationFrame holds the OLD updateWaveform reference?
  // Yes. But inside the old one, it checks status. 
  // If status is still recording, it calls requestAnimationFrame(updateWaveform).
  // The 'updateWaveform' variable will point to the NEW function if the component re-rendered.
  // So it should be fine.

  const startPreparing = async () => {
    setStatus("preparing")
    setPrepTimeLeft(prepTime)
    setRecordTimeLeft(recordTime)
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const resetRecording = () => {
    setStatus("idle")
    setAudioUrl(null)
    setPrepTimeLeft(prepTime)
    setRecordTimeLeft(recordTime)
    setWaveformData(Array(50).fill(0.1))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Status Display */}
        <div className="mb-6 text-center">
          {status === "idle" && <p className="text-lg text-muted-foreground">Click Start to begin preparation</p>}
          {status === "preparing" && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-amber-500">Prepare: {formatTime(prepTimeLeft)}</p>
              <Progress value={((prepTime - prepTimeLeft) / prepTime) * 100} className="h-2" />
            </div>
          )}
          {status === "recording" && (
            <div className="space-y-2">
              <p className="text-lg font-medium text-red-500 animate-pulse">Recording: {formatTime(recordTimeLeft)}</p>
              <Progress value={((recordTime - recordTimeLeft) / recordTime) * 100} className="h-2" />
            </div>
          )}
          {status === "recorded" && <p className="text-lg font-medium text-emerald-500">Recording Complete</p>}
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6 flex h-24 items-center justify-center gap-0.5 rounded-lg bg-muted/50 px-4">
          {waveformData.map((value, index) => (
            <div
              key={index}
              className={cn(
                "w-1 rounded-full transition-all duration-75",
                status === "recording" ? "bg-red-500" : "bg-primary/30",
              )}
              style={{ height: `${Math.max(10, value * 100)}%` }}
            />
          ))}
        </div>

        {/* Audio Playback */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {status === "idle" && (
            <Button onClick={startPreparing} size="lg" className="gap-2" disabled={isDisabled}>
              <Mic className="h-5 w-5" />
              Start
            </Button>
          )}

          {status === "recording" && (
            <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2">
              <Square className="h-5 w-5" />
              Stop
            </Button>
          )}

          {status === "recorded" && (
            <>
              <Button onClick={playRecording} size="lg" variant="outline" className="gap-2 bg-transparent">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button onClick={resetRecording} size="lg" variant="outline" className="gap-2 bg-transparent">
                <RotateCcw className="h-5 w-5" />
                Redo
              </Button>
              <Button onClick={onSubmit} size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Submit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
