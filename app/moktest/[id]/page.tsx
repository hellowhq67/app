'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PTEAppSidebar } from "@/components/pte/pte-app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Target, 
  Volume2, 
  Eye, 
  EyeOff,
  Camera,
  Monitor,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { mockTestQuestions, MockTestType } from "@/data/mockTestQuestions";
import { useUserHistory } from "@/hooks/useUserHistory";
import { useScoringLimit } from "@/hooks/useScoringLimit";
import { ScoreResult } from "@/lib/scoring";

interface TestSession {
  id: string;
  testType: MockTestType;
  startTime: Date;
  currentQuestionIndex: number;
  completedQuestions: Set<string>;
  isProctoringEnabled: boolean;
  backgroundMonitoringActive: boolean;
  aiAnalysisActive: boolean;
}

export default function MockTestSession() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showProctoringWarning, setShowProctoringWarning] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  
  const { saveAttempt } = useUserHistory();
  const { incrementUsage } = useScoringLimit();

  // Initialize test session
  useEffect(() => {
    const testType = MockTestType.FULL_TEST; // 2-hour full test
    const questions = mockTestQuestions.filter(q => q.type === testType);
    
    setSession({
      id: testId,
      testType,
      startTime: new Date(),
      currentQuestionIndex: 0,
      completedQuestions: new Set(),
      isProctoringEnabled: true,
      backgroundMonitoringActive: true,
      aiAnalysisActive: true,
    });
    
    setCurrentQuestion(questions[0]);
    
    // Start background monitoring
    startBackgroundMonitoring();
    
    // Start AI analysis
    startAIAnalysis();
  }, [testId]);

  const startBackgroundMonitoring = () => {
    // Simulate background monitoring
    console.log("Starting background monitoring for test session:", testId);
    
    // Monitor tab switching, window focus, etc.
    const handleVisibilityChange = () => {
      if (document.hidden && session?.isProctoringEnabled) {
        setShowProctoringWarning(true);
        setTimeout(() => setShowProctoringWarning(false), 5000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const startAIAnalysis = () => {
    // Simulate AI analysis providing insights
    const insights = [
      "Maintain good posture for speaking tasks",
      "Speak clearly and at a moderate pace",
      "Focus on key information in listening tasks",
      "Manage your time effectively across sections"
    ];
    
    setAiInsights(insights);
  };

  const getElapsedTime = () => {
    if (!session?.startTime) return "00:00:00";
    const elapsed = Date.now() - session.startTime.getTime();
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!session) return 0;
    const questions = mockTestQuestions.filter(q => q.type === session.testType);
    return ((session.currentQuestionIndex + 1) / questions.length) * 100;
  };

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate AI-powered scoring
      const score: ScoreResult = {
        pronunciation: Math.floor(Math.random() * 20) + 75,
        fluency: Math.floor(Math.random() * 20) + 75,
        content: Math.floor(Math.random() * 25) + 70,
        overall: Math.floor(Math.random() * 20) + 75,
        feedback: "AI analysis: Good performance with room for improvement in pronunciation.",
        breakdown: {
          ai_confidence: 0.92,
          speech_clarity: 0.85,
          content_relevance: 0.88,
        }
      };
      
      await saveAttempt({
        questionId: currentQuestion.id,
        testType: currentQuestion.type,
        spokenText: userAnswer,
        score,
        durationSeconds: recordingTime,
      });
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setTimeout(() => {
        clearInterval(interval);
        setIsRecording(false);
      }, 30000);
    }
  };

  const handleNext = () => {
    if (!session) return;
    
    const questions = mockTestQuestions.filter(q => q.type === session.testType);
    const nextIndex = session.currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      const newSession = {
        ...session,
        currentQuestionIndex: nextIndex,
        completedQuestions: new Set([...session.completedQuestions, currentQuestion.id])
      };
      setSession(newSession);
      setCurrentQuestion(questions[nextIndex]);
      setUserAnswer("");
      setRecordingTime(0);
    } else {
      // Test completed
      router.push("/pte/mock-tests/completion");
    }
  };

  const handlePrevious = () => {
    if (!session || session.currentQuestionIndex === 0) return;
    
    const questions = mockTestQuestions.filter(q => q.type === session.testType);
    const prevIndex = session.currentQuestionIndex - 1;
    
    const newSession = {
      ...session,
      currentQuestionIndex: prevIndex
    };
    setSession(newSession);
    setCurrentQuestion(questions[prevIndex]);
  };

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Loading Test Session</h2>
          <p className="text-muted-foreground">Initializing AI monitoring systems...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PTEAppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Monitoring Status */}
          <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="px-4 py-3 flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              
              <div className="flex-1">
                <h1 className="text-lg font-bold gradient-text">2-Hour Full Mock Test</h1>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {getElapsedTime()}
                  </Badge>
                  <Badge variant={session.backgroundMonitoringActive ? "default" : "destructive"} className="gap-1">
                    <Camera className="h-3 w-3" />
                    {session.backgroundMonitoringActive ? "Monitoring Active" : "Monitoring Disabled"}
                  </Badge>
                  <Badge variant={session.aiAnalysisActive ? "default" : "secondary"} className="gap-1">
                    <Target className="h-3 w-3" />
                    AI Analysis Active
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-lg font-bold">{Math.round(getProgress())}%</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="px-4 pb-3">
              <Progress value={getProgress()} className="h-2" />
            </div>
          </header>

          {/* Proctoring Warning */}
          {showProctoringWarning && (
            <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800">
                <strong>Warning:</strong> Tab switching detected. This may affect your test score.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* AI Insights Panel */}
              {session.aiAnalysisActive && aiInsights.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Target className="h-5 w-5" />
                      AI Real-Time Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {aiInsights.map((insight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                          <CheckCircle className="h-4 w-4" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Question Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Question {session.currentQuestionIndex + 1} - {currentQuestion.type}
                    </CardTitle>
                    <Badge variant="outline">
                      {currentQuestion.points || 10} points
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Content */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {/* Instructions */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Instructions:</strong> {currentQuestion.instructions || "Follow the instructions carefully."}
                    </p>
                  </div>

                  {/* Recording Interface */}
                  <div className="p-6 border-2 border-dashed border-muted-foreground/50 rounded-lg text-center">
                    {isRecording ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-500 font-medium">Recording with AI Analysis...</span>
                        </div>
                        <div className="text-2xl font-mono">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <Button onClick={handleRecord} variant="destructive" size="lg">
                          Stop Recording
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Volume2 className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click to start recording. AI will analyze your response in real-time.
                        </p>
                        <Button onClick={handleRecord} size="lg" className="gap-2">
                          <Volume2 className="h-5 w-5" />
                          Start Recording
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={session.currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
