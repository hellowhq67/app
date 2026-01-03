"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Clock, GraduationCap, Play, Settings, Target } from "lucide-react";
import { HistoryPanel } from "./_components/HistoryPanel";
import { startMockTest } from "@/lib/actions/mock-test";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface MockTestHistoryItem {
  id: string;
  testType: string;
  testName?: string;
  createdAt: Date;
  overallScore?: number;
  totalQuestions: number;
  totalDuration?: number; // seconds
  status: "completed" | "in_progress" | "not_started" | "expired" | "abandoned";
}

interface MockTestClientProps {
  initialHistory: MockTestHistoryItem[];
}

export default function MockTestClient({ initialHistory }: MockTestClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStartTest = async (testType: 'full_test' | 'speaking_section' | 'writing_section' | 'reading_section' | 'listening_section', testName: string) => {
    setIsStarting(true);
    try {
      const result = await startMockTest({ testType, testName });

      if (result.success && result.testId) {
        toast.success("Test started successfully!");
        router.push(`/pte/mock-tests/${result.testId}`);
      } else {
        toast.error("Failed to start test");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mock Tests</h1>
        <p className="text-muted-foreground">
          Practice with full-length mock tests or focus on specific sections.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Full Mock Test */}
            <Card className="col-span-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Full Mock Test
                    </CardTitle>
                    <CardDescription>
                      Simulation of the real PTE Academic exam
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleStartTest('full_test', 'Full Mock Test')} disabled={isStarting}>
                    {isStarting ? "Starting..." : "Start Test"} <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>2 hours 15 mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BrainCircuit className="h-4 w-4" />
                  <span>AI Scored</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>~70 Questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  <span>All Sections</span>
                </div>
              </CardContent>
            </Card>

            {/* Speaking Section */}
            <Card>
              <CardHeader>
                <CardTitle>Speaking Section</CardTitle>
                <CardDescription>Focus on oral fluency and pronunciation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> 30-35 minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" /> ~35 questions
                  </div>
                </div>
                <Button className="w-full" variant="secondary" onClick={() => handleStartTest('speaking_section', 'Speaking Section Mock')} disabled={isStarting}>
                  Start Speaking Mock
                </Button>
              </CardContent>
            </Card>

            {/* Writing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Writing Section</CardTitle>
                <CardDescription>Practice essay and summary writing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> 30-40 minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" /> 3-4 questions
                  </div>
                </div>
                <Button className="w-full" variant="secondary" onClick={() => handleStartTest('writing_section', 'Writing Section Mock')} disabled={isStarting}>
                  Start Writing Mock
                </Button>
              </CardContent>
            </Card>

            {/* Reading Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Section</CardTitle>
                <CardDescription>Improve reading comprehension</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> 29-30 minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" /> 15-20 questions
                  </div>
                </div>
                <Button className="w-full" variant="secondary" onClick={() => handleStartTest('reading_section', 'Reading Section Mock')} disabled={isStarting}>
                  Start Reading Mock
                </Button>
              </CardContent>
            </Card>

            {/* Listening Section */}
            <Card>
              <CardHeader>
                <CardTitle>Listening Section</CardTitle>
                <CardDescription>Practice auditory skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> 30-43 minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" /> 15-22 questions
                  </div>
                </div>
                <Button className="w-full" variant="secondary" onClick={() => handleStartTest('listening_section', 'Listening Section Mock')} disabled={isStarting}>
                  Start Listening Mock
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <HistoryPanel history={initialHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
