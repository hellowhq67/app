"use client"

import { useState, useEffect } from "react";
import { PTELayoutClient } from "@/components/pte/pte-layout-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Headphones, Target, TrendingUp, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";

// Mock data for listening tasks
const LISTENING_TASKS = [
  { id: "sst", title: "Summarize Spoken Text", type: "summarize_spoken_text", total: 50 },
  { id: "mcq_lm", title: "Multiple Choice (Multiple)", type: "multiple_choice_multiple", total: 60 },
  { id: "fib_l", title: "Fill in Blanks", type: "fill_in_blanks", total: 70 },
  { id: "hcs", title: "Highlight Correct Summary", type: "highlight_correct_summary", total: 40 },
  { id: "mcq_ls", title: "Multiple Choice (Single)", type: "multiple_choice_single", total: 50 },
  { id: "smw", title: "Select Missing Word", type: "select_missing_word", total: 45 },
  { id: "hiw", title: "Highlight Incorrect Words", type: "highlight_incorrect_words", total: 55 },
  { id: "wfd", title: "Write From Dictation", type: "write_from_dictation", total: 120 },
];

interface UserListeningStats {
  [taskType: string]: {
    questionsCount: number;
    completedCount: number;
    averageScore: number;
    lastPracticed?: string;
  };
}

export default function ListeningPracticePage() {
  const { user, isAuthenticated, isLoading, initializeUser } = useAppStore();
  const [userStats, setUserStats] = useState<UserListeningStats>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Initialize user on mount
  useEffect(() => {
    if (!user && !isLoading) {
      initializeUser();
    }
  }, [user, isLoading, initializeUser]);

  // Load user statistics
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserStats();
    }
  }, [isAuthenticated, user]);

  const loadUserStats = async () => {
    setIsLoadingStats(true);
    try {
      // Load listening attempts from database
      const response = await fetch("/api/listening/attempts");
      if (response.ok) {
        const attempts = await response.json();

        // Process attempts to calculate stats
        const stats: UserListeningStats = {};

        LISTENING_TASKS.forEach((task) => {
          const taskAttempts = attempts.filter(
            (attempt: any) => attempt.type === task.type
          );

          stats[task.type] = {
            questionsCount: task.total,
            completedCount: taskAttempts.length,
            averageScore:
              taskAttempts.length > 0
                ? taskAttempts.reduce(
                    (sum: number, attempt: any) => sum + (attempt.overallScore || 0),
                    0
                  ) / taskAttempts.length
                : 0,
            lastPracticed:
              taskAttempts.length > 0
                ? new Date(taskAttempts[0].createdAt).toLocaleDateString()
                : undefined,
          };
        });

        setUserStats(stats);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getOverallProgress = () => {
    const totalQuestions = Object.values(userStats).reduce(
      (acc, stat) => acc + stat.questionsCount,
      0
    );
    const completedQuestions = Object.values(userStats).reduce(
      (acc, stat) => acc + stat.completedCount,
      0
    );
    return totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
  };

  const getAverageScore = () => {
    const scores = Object.values(userStats)
      .map((stat) => stat.averageScore)
      .filter((score) => score > 0);
    return scores.length > 0
      ? scores.reduce((acc, score) => acc + score, 0) / scores.length
      : 0;
  };

  if (isLoading || isLoadingStats) {
    return (
      <PTELayoutClient>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading listening practice...</p>
          </div>
        </div>
      </PTELayoutClient>
    );
  }

  if (!isAuthenticated) {
    return (
      <PTELayoutClient>
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <Headphones className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access listening practice features
            </p>
            <Button onClick={() => (window.location.href = "/login")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </PTELayoutClient>
    );
  }

  return (
    <PTELayoutClient>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* User Welcome Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-muted-foreground">
                Improve your listening skills with targeted practice questions.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>
                    {user?.rateLimit?.dailyQuestionsLimit
                      ? user.rateLimit.dailyQuestionsLimit - (user?.rateLimit?.dailyQuestionsUsed || 0)
                      : 10}{" "}
                    questions remaining today
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(getOverallProgress())}%
                </div>
                <div className="text-xs text-muted-foreground">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(getAverageScore())}%
                </div>
                <div className="text-xs text-muted-foreground">Average Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Headphones className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {Object.values(userStats).reduce(
                      (acc, stat) => acc + stat.completedCount,
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Questions Completed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {Math.round(getAverageScore())}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {Math.round(getOverallProgress())}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {user?.rateLimit?.dailyQuestionsLimit
                      ? user.rateLimit.dailyQuestionsLimit - (user?.rateLimit?.dailyQuestionsUsed || 0)
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining Today
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listening Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listening Practice Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LISTENING_TASKS.map((task, index) => {
                const stats = userStats[task.type] || {
                  completedCount: 0,
                  averageScore: 0,
                  questionsCount: task.total,
                };
                const progress = (stats.completedCount / stats.questionsCount) * 100;

                return (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {stats.completedCount} of {stats.questionsCount} completed
                      </div>
                    </div>
                    
                    <div className="w-1/4 px-4">
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-right text-muted-foreground mt-1">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {stats.averageScore ? Math.round(stats.averageScore) : "0"}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg. Score</div>
                      </div>
                      
                      <Button asChild>
                        <a href={`/pte/practice-new/listening/${task.type}`}>
                          Practice
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PTELayoutClient>
  );
}