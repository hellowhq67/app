import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Clock, Target, Volume2 } from "lucide-react";

interface MockTestProps {
  question: any;
  questionIndex: number;
  totalQuestions: number;
  testStartTime: Date | null;
  onComplete: (score: any, text: string, duration?: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function MockTest({
  question,
  questionIndex,
  totalQuestions,
  testStartTime,
  onComplete,
  onNext,
  onPrevious,
}: MockTestProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate recording completion
      onComplete(
        { pronunciation: 85, fluency: 80, content: 90, overall: 85 },
        userAnswer || "Sample answer text",
        recordingTime
      );
    } else {
      setIsRecording(true);
      // Start recording timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      // Simulate recording stop after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        setIsRecording(false);
        onComplete(
          { pronunciation: 85, fluency: 80, content: 90, overall: 85 },
          userAnswer || "Sample answer text",
          30
        );
      }, 30000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {question.type || "Mock Test Question"}
            </CardTitle>
            <Badge variant="outline">
              {question.points || "10"} points
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Content */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm leading-relaxed">
              {question.question || "Sample mock test question. This would contain the actual question content."}
            </p>
          </div>

          {/* Media/Visual Content (if applicable) */}
          {question.hasImage && (
            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/50">
              <p className="text-center text-muted-foreground">
                [Image would be displayed here]
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Instructions:</strong> {question.instructions || "Read the question carefully and provide your answer."}
            </p>
          </div>

          {/* Answer Section */}
          {!hasStarted ? (
            <div className="text-center py-8">
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Target className="h-5 w-5" />
                Start Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recording Interface */}
              <div className="p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 font-medium">Recording...</span>
                    </div>
                    <div className="text-2xl font-mono">
                      {formatTime(recordingTime)}
                    </div>
                    <Button onClick={handleRecord} variant="destructive" size="lg">
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Volume2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Click to start recording your answer
                    </p>
                    <Button onClick={handleRecord} size="lg" className="gap-2">
                      <Volume2 className="h-5 w-5" />
                      Start Recording
                    </Button>
                  </div>
                )}
              </div>

              {/* Text Answer Input (for writing questions) */}
              {question.requiresTextInput && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Answer:</label>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={questionIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {testStartTime && formatTime(Math.floor((Date.now() - testStartTime.getTime()) / 1000))}
        </div>

        <Button onClick={onNext} className="gap-2">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
