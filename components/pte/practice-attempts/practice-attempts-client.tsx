"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Target, TrendingUp, ArrowUpDown, Filter, Eye } from "lucide-react";
import { FeedbackCard } from "@/components/pte/feedback/FeedbackCard";
import { AIFeedbackData } from "@/lib/types";

type Section = 'speaking' | 'writing' | 'reading' | 'listening';

interface PracticeAttempt {
  id: string;
  questionTitle: string;
  questionType: string;
  section: Section;
  score: number;
  maxScore: number;
  timeSpent: number;
  completedAt: string;
  feedback?: AIFeedbackData;
}

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';

export function PracticeAttemptsClient({ initialAttempts }: { initialAttempts: PracticeAttempt[] }) {
  const [sectionFilter, setSectionFilter] = useState<Section | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [selectedAttempt, setSelectedAttempt] = useState<PracticeAttempt | null>(null);

  // Filter and sort attempts
  const filteredAttempts = useMemo(() => {
    let filtered = initialAttempts;

    // Apply section filter
    if (sectionFilter !== 'all') {
      filtered = filtered.filter(a => a.section === sectionFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'date-asc':
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        case 'score-desc':
          return b.score - a.score;
        case 'score-asc':
          return a.score - b.score;
        default:
          return 0;
      }
    });
  }, [initialAttempts, sectionFilter, sortBy]);

  const averageScore =
    filteredAttempts.length > 0
      ? Math.round(
        filteredAttempts.reduce(
          (acc, attempt) => acc + (attempt.score / attempt.maxScore) * 100,
          0
        ) / filteredAttempts.length
      )
      : 0;

  const totalTimeSpent = filteredAttempts.reduce(
    (acc, attempt) => acc + attempt.timeSpent,
    0
  );

  const sectionColors: Record<Section, string> = {
    speaking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    writing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    reading: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    listening: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attempts
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAttempts.length}</div>
            <p className="text-xs text-muted-foreground">
              {sectionFilter === 'all' ? 'All sections' : `${sectionFilter} section`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">Performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(totalTimeSpent / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">Total practice time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredAttempts.filter((a) => {
                  const attemptDate = new Date(a.completedAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return attemptDate > weekAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Recent attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sectionFilter} onValueChange={(v) => setSectionFilter(v as Section | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="speaking">Speaking</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="listening">Listening</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="score-desc">Highest Score</SelectItem>
              <SelectItem value="score-asc">Lowest Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attempts List */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Attempts ({filteredAttempts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attempts found. Start practicing to see your progress here!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{attempt.questionTitle}</h3>
                      <Badge className={sectionColors[attempt.section]}>
                        {attempt.section}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round((attempt.score / attempt.maxScore) * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{attempt.questionType}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {attempt.score}/{attempt.maxScore}
                      </div>
                      <Progress
                        value={(attempt.score / attempt.maxScore) * 100}
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                    {attempt.feedback && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAttempt(attempt)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAttempt?.questionTitle}</DialogTitle>
          </DialogHeader>
          {selectedAttempt?.feedback && (
            <FeedbackCard
              feedback={selectedAttempt.feedback}
              questionType={selectedAttempt.questionType}
              onClose={() => setSelectedAttempt(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
