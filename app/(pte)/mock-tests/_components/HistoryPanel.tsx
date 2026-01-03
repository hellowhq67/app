import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Target, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";
import { type MockTestHistoryItem } from "../MockTestClient";

interface HistoryPanelProps {
  history: MockTestHistoryItem[];
}

export function HistoryPanel({ history }: HistoryPanelProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "abandoned":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-muted-foreground";
    if (score >= 79) return "text-green-600";
    if (score >= 65) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Test History</h3>
        <p className="text-muted-foreground">
          You haven't taken any mock tests yet. Start practicing to see your history here.
        </p>
      </div>
    );
  }

  const completedTests = history.filter(t => t.status === 'completed');
  const avgScore = completedTests.length > 0
    ? Math.round(completedTests.reduce((acc, t) => acc + (t.overallScore || 0), 0) / completedTests.length)
    : 0;
  const bestScore = completedTests.length > 0
    ? Math.max(...completedTests.map(t => t.overallScore || 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">{completedTests.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore}</div>
            <p className="text-xs text-muted-foreground">Highest achievement</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Test History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {history.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold truncate">{test.testName || test.testType}</h4>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.status === 'in_progress' ? 'In Progress' : formatDuration(test.totalDuration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {test.totalQuestions} questions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(test.overallScore || undefined)}`}>
                        {test.overallScore !== null ? test.overallScore : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <Link href={`/pte/mock-tests/${test.id}`} passHref>
                      <Button variant="outline" size="sm" className="gap-1">
                        {test.status === 'in_progress' ? (
                          <>
                            <TrendingUp className="h-3 w-3" /> Resume
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" /> View
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
