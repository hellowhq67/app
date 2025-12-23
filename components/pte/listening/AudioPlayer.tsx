'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

type Props = {
  audioUrl: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export default function AudioPlayer({
  audioUrl,
  onPlay,
  onPause,
  onEnded,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleError = () => {
      setError('Failed to load audio')
      setLoading(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [onEnded])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      onPause?.()
    } else {
      audio.play()
      setIsPlaying(true)
      onPlay?.()
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="rounded-md border bg-red-50 p-4 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border bg-gray-50 p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <Button
          onClick={togglePlay}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? '...' : isPlaying ? '⏸ Pause' : '▶ Play'}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={loading}
            className="w-full"
          />
        </div>

        <span className="text-muted-foreground min-w-[80px] text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">🔊</span>
        <Slider
          value={[volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="w-24"
        />
      </div>
    </div>
  )
}
