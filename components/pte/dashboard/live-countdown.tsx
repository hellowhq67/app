"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface LiveCountdownProps {
  examDate: string;
  examName: string;
}

export function LiveCountdown({ examDate, examName }: LiveCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      const now = new Date();
      const exam = new Date(examDate);
      const diff = exam.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Initial update
    updateCountdown();

    // Update every second for smooth countdown
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [examDate]);

  const getMotivationalMessage = () => {
    const days = timeLeft.days;
    if (days === 0) return "Exam day is here! Good luck! 🎯";
    if (days < 7) return "Final week! Stay focused 💪";
    if (days <= 30) return "Almost there! Keep practicing 📚";
    if (days <= 60) return "Great progress! You have time ⏰";
    return "Excellent! You have plenty of time to prepare 🎓";
  };

  return (
    <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-gray-900">Exam Countdown</CardTitle>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            {examName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Display */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div
              className="text-2xl font-bold text-gray-900"
              suppressHydrationWarning
            >
              {timeLeft.days}
            </div>
            <div className="text-xs text-gray-600">Days</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div
              className="text-2xl font-bold text-gray-900"
              suppressHydrationWarning
            >
              {timeLeft.hours}
            </div>
            <div className="text-xs text-gray-600">Hours</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div
              className="text-2xl font-bold text-gray-900"
              suppressHydrationWarning
            >
              {timeLeft.minutes}
            </div>
            <div className="text-xs text-gray-600">Mins</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
            <div
              className="text-2xl font-bold text-gray-900"
              suppressHydrationWarning
            >
              {timeLeft.seconds}
            </div>
            <div className="text-xs text-gray-600">Secs</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-center">
          <p className="text-sm font-medium text-gray-700">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Exam Date */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Exam Date:{" "}
            <span
              className="font-semibold text-gray-900"
              suppressHydrationWarning
            >
              {mounted
                ? new Date(examDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : examDate}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
