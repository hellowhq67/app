'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PTETimerState } from '@/types/pte-types';

interface PTETimerProps {
  totalTime: number;
  remainingTime: number;
  isRunning: boolean;
  stage?: 'preparation' | 'response' | 'completed';
  onTimeUp?: () => void;
  onWarning?: () => void;
  onCritical?: () => void;
  className?: string;
}

const PTETimer: React.FC<PTETimerProps> = ({
  totalTime,
  remainingTime,
  isRunning,
  stage = 'response',
  onTimeUp,
  onWarning,
  onCritical,
  className = ''
}) => {
  const [timeState, setTimeState] = useState<PTETimerState>({
    totalTime,
    remainingTime,
    isRunning,
    isPaused: false,
    stage
  });

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = useCallback((remaining: number): string => {
    const warningThreshold = 120; // 2 minutes
    const criticalThreshold = 30; // 30 seconds
    
    if (remaining <= criticalThreshold) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (remaining <= warningThreshold) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-gray-700 bg-white border-gray-300';
  }, []);

  const getStageText = useCallback((stage: string): string => {
    switch (stage) {
      case 'preparation':
        return 'Preparation Time';
      case 'response':
        return 'Response Time';
      case 'completed':
        return 'Completed';
      default:
        return 'Time Remaining';
    }
  }, []);

  useEffect(() => {
    setTimeState(prev => ({
      ...prev,
      remainingTime,
      isRunning,
      stage
    }));
  }, [remainingTime, isRunning, stage]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeState(prev => {
        const newTime = Math.max(0, prev.remainingTime - 1);
        
        if (newTime === 0) {
          onTimeUp?.();
          return { ...prev, remainingTime: 0, isRunning: false };
        }
        
        if (newTime === 120) {
          onWarning?.();
        }
        
        if (newTime === 30) {
          onCritical?.();
        }
        
        return { ...prev, remainingTime: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp, onWarning, onCritical]);

  const timerColor = getTimerColor(timeState.remainingTime);
  const progressPercentage = ((totalTime - timeState.remainingTime) / totalTime) * 100;

  return (
    <div className={`flex flex-col items-center p-4 border-2 rounded-lg ${timerColor} ${className}`}>
      <div className="text-sm font-medium mb-2">
        {getStageText(timeState.stage)}
      </div>
      
      <div className="text-3xl font-bold mb-3 font-mono">
        {formatTime(timeState.remainingTime)}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            timeState.remainingTime <= 30 ? 'bg-red-500' :
            timeState.remainingTime <= 120 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-600">
        Total: {formatTime(totalTime)}
      </div>
      
      {timeState.stage === 'preparation' && (
        <div className="mt-2 text-sm text-blue-600 font-medium">
          Get ready! Recording will start automatically.
        </div>
      )}
      
      {timeState.remainingTime <= 30 && (
        <div className="mt-2 text-sm text-red-600 font-medium animate-pulse">
          Time running out!
        </div>
      )}
    </div>
  );
};

export default PTETimer;
