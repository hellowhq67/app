import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Target, TrendingUp, Eye } from "lucide-react";

interface MockTestHistory {
  id: string;
  testType: string;
  date: Date;
  score: number;
  totalQuestions: number;
  duration: number;
  status: "completed" | "in-progress" | "not-started";
}

export function HistoryPanel() {
  // Mock data - in real app this would come from API
  const mockHistory: MockTestHistory[] = [
    {
      id: "1",
      testType: "Full Mock Test",
      date: new Date("2024-01-15"),
      score: 78,
      totalQuestions: 20,
      duration: 1800,
      status: "completed",
    },
    {
      id: "2",
      testType: "Speaking Section",
      date: new Date("2024-01-14"),
      score: 82,
      totalQuestions: 5,
      duration: 600,
      status: "completed",
    },
    {
      id: "3",
      testType: "Full Mock Test",
      date: new Date("2024-01-13"),
      score: 75,
      totalQuestions: 20,
      duration: 1820,
      status: "completed",
    },
    {
      id: "4",
      testType: "Writing Section",
      date: new Date("2024-01-12"),
      score: 80,
      totalQuestions: 2,
      duration: 480,
      status: "completed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 79) return "text-green-600";
    if (score >= 65) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (mockHistory.length === 0) {
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
            <div className="text-2xl font-bold">{mockHistory.length}</div>
            <p className="text-xs text-muted-foreground">Completed tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                mockHistory.reduce((acc, test) => acc + test.score, 0) / mockHistory.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...mockHistory.map((test) => test.score))}
            </div>
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
              {mockHistory.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold truncate">{test.testType}</h4>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(test.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(test.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {test.totalQuestions} questions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                        {test.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
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
