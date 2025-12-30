'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PTEAudioState } from '@/types/pte-types';

interface PTAudioPlayerProps {
  audioUrl: string;
  maxPlays?: number;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onPlayCountChange?: (count: number) => void;
  onError?: (error: string) => void;
  className?: string;
}

const PTAudioPlayer: React.FC<PTAudioPlayerProps> = ({
  audioUrl,
  maxPlays = 1,
  autoPlay = false,
  onPlay,
  onPause,
  onEnded,
  onPlayCountChange,
  onError,
  className = ''
}) => {
  const [audioState, setAudioState] = useState<PTEAudioState>({
    isPlaying: false,
    isRecording: false,
    volume: 0.8,
    duration: 0,
    currentTime: 0,
    playCount: 0,
    maxPlays
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (audioState.playCount >= maxPlays) {
      onError?.(`Maximum ${maxPlays} plays allowed`);
      return;
    }

    audioRef.current.play();
    setAudioState(prev => ({
      ...prev,
      isPlaying: true,
      playCount: prev.playCount + 1
    }));
    
    onPlay?.();
    onPlayCountChange?.(audioState.playCount + 1);
  }, [audioState.playCount, maxPlays, onPlay, onPlayCountChange, onError]);

  const handlePause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
  }, [onPause]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setAudioState(prev => ({ ...prev, volume }));
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setAudioState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const canPlay = audioState.playCount < maxPlays;
  const playButtonDisabled = !canPlay || audioState.isPlaying;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setAudioState(prev => ({
        ...prev,
        duration: audio.duration || 0
      }));
    };

    const handleTimeUpdate = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime || 0
      }));
    };

    const handleAudioEnded = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleAudioError = () => {
      onError?.('Audio playback failed');
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [onEnded, onError]);

  useEffect(() => {
    if (autoPlay && audioRef.current && canPlay) {
      handlePlay();
    }
  }, [autoPlay, canPlay, handlePlay]);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />
      
      {/* Play Count Indicator */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">
          Plays: {audioState.playCount} / {maxPlays}
        </span>
        {!canPlay && (
          <span className="text-sm text-red-600 font-medium">
            Play limit reached
          </span>
        )}
      </div>

      {/* Audio Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handlePlay}
          disabled={playButtonDisabled}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            playButtonDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {audioState.isPlaying ? 'Playing...' : 'Play'}
        </button>
        
        <button
          onClick={handlePause}
          disabled={!audioState.isPlaying}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            !audioState.isPlaying
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          Pause
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{formatTime(audioState.currentTime)}</span>
          <span>{formatTime(audioState.duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={audioState.duration || 0}
          value={audioState.currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
              (audioState.currentTime / audioState.duration) * 100
            }%, #E5E7EB ${
              (audioState.currentTime / audioState.duration) * 100
            }%, #E5E7EB 100%)`
          }}
        />
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Volume:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={audioState.volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600">
          {Math.round(audioState.volume * 100)}%
        </span>
      </div>

      {/* Status Messages */}
      {audioState.playCount >= maxPlays && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          You have reached the maximum number of plays for this audio.
        </div>
      )}
    </div>
  );
};

export default PTAudioPlayer;
