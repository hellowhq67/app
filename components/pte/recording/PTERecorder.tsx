'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PTEAudioState } from '@/types/pte-types';

interface PTERecorderProps {
  onRecordingStart?: () => void;
  onRecordingStop?: (audioBlob: Blob) => void;
  onRecordingComplete?: (audioUrl: string) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  autoStart?: boolean;
  className?: string;
}

const PTERecorder: React.FC<PTERecorderProps> = ({
  onRecordingStart,
  onRecordingStop,
  onRecordingComplete,
  onError,
  maxDuration = 120000, // 2 minutes default
  autoStart = false,
  className = ''
}) => {
  const [recordingState, setRecordingState] = useState<PTEAudioState>({
    isRecording: false,
    isPlaying: false,
    volume: 0,
    duration: 0,
    currentTime: 0,
    playCount: 0,
    maxPlays: 0
  });

  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      return true;
    } catch (error) {
      setPermissionGranted(false);
      onError?.('Microphone access denied');
      return false;
    }
  }, [onError]);

  const startRecording = useCallback(async () => {
    if (recordingState.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      streamRef.current = stream;
      
      // Setup audio analysis for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordingState(prev => ({ ...prev, isRecording: false, audioBlob }));
        onRecordingStop?.(audioBlob);
        onRecordingComplete?.(audioUrl);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState(prev => ({ ...prev, isRecording: true }));
      onRecordingStart?.();

      // Auto-stop after max duration
      if (maxDuration > 0) {
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            stopRecording();
          }
        }, maxDuration);
      }

    } catch (error) {
      onError?.('Failed to start recording');
      console.error('Recording error:', error);
    }
  }, [recordingState.isRecording, maxDuration, onRecordingStart, onRecordingStop, onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

    mediaRecorderRef.current.stop();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setAudioLevel(0);
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !recordingState.isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = (average / 255) * 100;
    
    setAudioLevel(normalizedLevel);
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [recordingState.isRecording]);

  useEffect(() => {
    if (recordingState.isRecording) {
      updateAudioLevel();
    }
  }, [recordingState.isRecording, updateAudioLevel]);

  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  useEffect(() => {
    if (autoStart && permissionGranted === true) {
      startRecording();
    }
  }, [autoStart, permissionGranted, startRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecording();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stopRecording]);

  if (permissionGranted === null) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking microphone permission...</p>
        </div>
      </div>
    );
  }

  if (permissionGranted === false) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">Microphone Access Required</div>
          <p className="text-red-700 text-sm mb-3">
            Please allow microphone access to record your responses.
          </p>
          <button
            onClick={checkMicrophonePermission}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}>
      {/* Recording Status */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">
          {recordingState.isRecording ? 'Recording...' : 'Ready to Record'}
        </span>
        {recordingState.isRecording && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Audio Level Visualization */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Level:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${
                recordingState.isRecording 
                  ? audioLevel > 50 ? 'bg-green-500' : 
                    audioLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  : 'bg-gray-300'
              }`}
              style={{ width: `${recordingState.isRecording ? audioLevel : 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-10 text-right">
            {Math.round(audioLevel)}%
          </span>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex space-x-3">
        <button
          onClick={startRecording}
          disabled={recordingState.isRecording}
          className={`flex-1 px-4 py-3 rounded font-medium transition-colors ${
            recordingState.isRecording
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {recordingState.isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        
        <button
          onClick={stopRecording}
          disabled={!recordingState.isRecording}
          className={`flex-1 px-4 py-3 rounded font-medium transition-colors ${
            !recordingState.isRecording
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Stop Recording
        </button>
      </div>

      {/* Recording Timer */}
      {recordingState.isRecording && (
        <div className="mt-3 text-center">
          <div className="text-lg font-mono text-gray-700">
            {formatTime(recordingState.duration)}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Recording Tips:</strong>
          <br />• Speak clearly and at a moderate pace
          <br />• Keep consistent distance from microphone
          <br />• Minimize background noise
        </p>
      </div>
    </div>
  );
};

export default PTERecorder;
