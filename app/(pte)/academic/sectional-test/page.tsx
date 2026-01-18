"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Clock,
  Target,
  FileQuestion,
  TrendingUp,
  Play,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "speaking",
    title: "Speaking",
    description:
      "Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Answer Short Question.",
    icon: Mic,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    gradient: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    buttonBg: "bg-blue-500 hover:bg-blue-600",
    questionCount: "26-33",
    timeEstimate: "~30 mins",
    skills: ["Pronunciation", "Fluency", "Content"],
  },
  {
    id: "writing",
    title: "Writing",
    description: "Summarize Written Text, Write Essay.",
    icon: PenTool,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    gradient: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/50",
    buttonBg: "bg-amber-500 hover:bg-amber-600",
    questionCount: "2-4",
    timeEstimate: "~40 mins",
    skills: ["Grammar", "Vocabulary", "Structure"],
  },
  {
    id: "reading",
    title: "Reading",
    description:
      "Multiple Choice, Re-order Paragraphs, Fill in the Blanks.",
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    gradient: "from-emerald-500/20 to-green-500/10",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    buttonBg: "bg-emerald-500 hover:bg-emerald-600",
    questionCount: "13-16",
    timeEstimate: "~30 mins",
    skills: ["Comprehension", "Vocabulary", "Analysis"],
  },
  {
    id: "listening",
    title: "Listening",
    description:
      "Summarize Spoken Text, Multiple Choice, Fill in Blanks, Dictation.",
    icon: Headphones,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    gradient: "from-purple-500/20 to-violet-500/10",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    buttonBg: "bg-purple-500 hover:bg-purple-600",
    questionCount: "13-19",
    timeEstimate: "~45 mins",
    skills: ["Comprehension", "Note-taking", "Spelling"],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SectionalTestDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const startTest = async (sectionId: string) => {
    try {
      setLoading(sectionId);
      const res = await fetch("/api/sectional-test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionId }),
      });

      const data = await res.json();

      if (res.ok && data.testId) {
        router.push(`/pte/academic/sectional-test/${data.testId}`);
      } else {
        toast({
          title: "Failed to start test",
          description: data.error || "Please try again later.",
          variant: "destructive",
        });
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Scoring
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Sectional Test Practice
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Focus on specific skills with targeted practice. Get detailed AI
              feedback on each section.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Why Sectional Tests?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Focus on one skill at a time. Get detailed feedback and
                  track improvement in specific areas before taking full mock tests.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                AI Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Instant Feedback
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Real Exam Format
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Cards */}
      <motion.div
        variants={item}
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isLoading = loading === section.id;
          return (
            <Card
              key={section.id}
              className={cn(
                "group relative overflow-hidden transition-all duration-300",
                section.borderColor,
                section.hoverBorder,
                "hover:shadow-lg hover:-translate-y-1"
              )}
            >
              {/* Gradient Background */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100",
                  section.gradient
                )}
              />

              <CardHeader className="relative space-y-3 pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      section.bg
                    )}
                  >
                    <Icon className={cn("w-6 h-6", section.color)} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {section.questionCount} Qs
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2 text-xs sm:text-sm">
                    {section.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-3 pb-2">
                {/* Time and Question Info */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {section.timeEstimate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileQuestion className="h-3.5 w-3.5" />
                    {section.questionCount} questions
                  </span>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {section.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="relative pt-2">
                <Button
                  className={cn(
                    "w-full text-white transition-all",
                    section.buttonBg
                  )}
                  onClick={() => startTest(section.id)}
                  disabled={!!loading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-pulse">Creating Test...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Test
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </motion.div>

      {/* Tips Section */}
      <motion.div variants={item}>
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mic className="w-3 h-3 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Speaking</p>
                  <p className="text-xs text-muted-foreground">
                    Speak clearly, maintain a steady pace, and use natural
                    pauses.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PenTool className="w-3 h-3 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">Writing</p>
                  <p className="text-xs text-muted-foreground">
                    Follow the structure: intro, body paragraphs, conclusion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-3 h-3 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium">Reading</p>
                  <p className="text-xs text-muted-foreground">
                    Skim first for main ideas, then read details carefully.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Headphones className="w-3 h-3 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Listening</p>
                  <p className="text-xs text-muted-foreground">
                    Take notes during audio. Focus on keywords and numbers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
