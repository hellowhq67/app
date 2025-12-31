
'use client'
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PTEAppSidebar } from "@/components/pte/pte-app-sidebar";
import { QuestionListPanel, MockTest, HistoryPanel } from "@/app/moktest/_components";
import { mockTestQuestions, MockTestType, getMockTestTypeInfo } from "@/data/mockTestQuestions";
import { useUserHistory } from "@/hooks/useUserHistory";
import { useScoringLimit } from "@/hooks/useScoringLimit";
import { ScoreResult } from "@/lib/scoring";
import { BookOpen, History, Menu, ListFilter, ChevronLeft, AlertCircle, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MockTestPage() {
  const [selectedTestType, setSelectedTestType] = useState<MockTestType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const { saveAttempt } = useUserHistory();
  const { remainingAttempts, canScore, incrementUsage } = useScoringLimit();

  const currentQuestions = selectedTestType
    ? mockTestQuestions.filter((q) => q.type === selectedTestType)
    : [];

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleComplete = async (score: ScoreResult | any, text: string, duration?: number) => {
    if (currentQuestion) {
      setCompletedQuestions((prev) => new Set(prev).add(currentQuestion.id));
      await saveAttempt({
        questionId: currentQuestion.id,
        testType: currentQuestion.type as MockTestType,
        spokenText: text,
        score,
        durationSeconds: duration || 0,
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setSelectedTestType(null);
      setCurrentQuestionIndex(0);
      setTestStartTime(null);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsQuestionPanelOpen(false);
  };

  const handleSelectTestType = (type: MockTestType) => {
    setSelectedTestType(type);
    setCurrentQuestionIndex(0);
    setTestStartTime(new Date());
  };

  const typeInfo = selectedTestType ? getMockTestTypeInfo(selectedTestType) : null;

  const getElapsedTime = () => {
    if (!testStartTime) return "00:00:00";
    const elapsed = Date.now() - testStartTime.getTime();
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PTEAppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
            <div className="px-4 py-3 flex items-center gap-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <h1 className="text-lg font-bold gradient-text">PTE Mock Tests</h1>

              {/* Test Timer - shows when a test type is selected */}
              {selectedTestType && testStartTime && (
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {getElapsedTime()}
                  </Badge>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </span>
                  <Sheet open={isQuestionPanelOpen} onOpenChange={setIsQuestionPanelOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span className="hidden sm:inline">Questions</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[450px] p-0">
                      <QuestionListPanel
                        testType={selectedTestType}
                        questions={currentQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        completedQuestions={completedQuestions}
                        onSelectQuestion={handleSelectQuestion}
                        onClose={() => setIsQuestionPanelOpen(false)}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-auto">
            {!selectedTestType ? (
              <Tabs defaultValue="mock-tests" className="space-y-6 max-w-4xl mx-auto">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="mock-tests" className="gap-2">
                    <Target className="h-4 w-4" /> Mock Tests
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" /> History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mock-tests">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">PTE Mock Tests</h2>
                    <p className="text-muted-foreground mb-6">
                      Select a mock test type to start practicing under exam conditions
                    </p>
                    {remainingAttempts === 0 && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-amber-800">
                          Daily test limit reached (1/day). Upgrade to premium for unlimited tests!
                        </p>
                      </div>
                    )}
                    <div className="grid gap-4 max-w-2xl mx-auto">
                      {Object.values(MockTestType).map((type) => {
                        const info = getMockTestTypeInfo(type);
                        return (
                          <Button
                            key={type}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start gap-2"
                            onClick={() => remainingAttempts > 0 && handleSelectTestType(type)}
                            disabled={remainingAttempts === 0}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-xl">{info?.icon}</span>
                              <span className="font-semibold">{info?.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground text-left">
                              {info?.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary">{info?.duration}</Badge>
                              <Badge variant="secondary">{info?.questions} questions</Badge>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <HistoryPanel />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex gap-4 h-full max-w-4xl mx-auto">
                {/* Test Area - Full Width, Responsive */}
                <div className="flex-1 w-full">
                  {/* Back button and header - Mobile friendly */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTestType(null)}
                        className="gap-1 -ml-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl shrink-0">{typeInfo?.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{typeInfo?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {currentQuestions.length} • {getElapsedTime()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {currentQuestion && (
                    <MockTest
                      key={currentQuestion.id}
                      question={currentQuestion}
                      questionIndex={currentQuestionIndex}
                      totalQuestions={currentQuestions.length}
                      testStartTime={testStartTime}
                      onComplete={(score, text, duration) => handleComplete(score, text, duration)}
                      onNext={handleNext}
                      onPrevious={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Question Panel Toggle Button - visible on larger screens when panel is closed */}
        {selectedTestType && (
          <Button
            variant="default"
            size="icon"
            className="fixed right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full shadow-lg bg-primary hidden xl:flex"
            onClick={() => setIsQuestionPanelOpen(true)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
    </SidebarProvider>
  );
}