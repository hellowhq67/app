import { PTEProgress } from "./useranalyticsType";
import { PTEScores } from "./scoringType";

export interface DashboardStats {
  totalPracticeTime: number;
  questionsAnswered: number;
  accuracy: number;
  streakDays: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: PTEProgress[];
  lastScores: PTEScores;
}
