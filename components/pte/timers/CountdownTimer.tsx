import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  label?: string;
  autoStart?: boolean;
}

export function CountdownTimer({
  initialSeconds,
  onComplete,
  label,
  autoStart = true,
}: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setMounted(true);
    if (!autoStart) return;

    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoStart, secondsLeft, onComplete]);

  const displayTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className="flex items-center gap-2 text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border"
      role="timer"
    >
      <Clock className="w-4 h-4" />
      {label && <span className="text-sm font-medium">{label}:</span>}
      <span
        className={`text-sm font-mono font-bold ${
          secondsLeft < 60 ? "text-red-500 animate-pulse" : ""
        }`}
        suppressHydrationWarning
      >
        {mounted
          ? displayTime()
          : `${Math.floor(initialSeconds / 60)
              .toString()
              .padStart(2, "0")}:${(initialSeconds % 60)
              .toString()
              .padStart(2, "0")}`}
      </span>
    </div>
  );
}

export default CountdownTimer;
