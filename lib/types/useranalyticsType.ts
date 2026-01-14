export interface PTEProgress {
  section: string;
  totalQuestions: number;
  completedQuestions: number;
  currentQuestion: number;
  timeRemaining: number;
}

export interface UserAttempt {
  questionId: string;
  testType: string;
  spokenText?: string;
  score?: any;
  durationSeconds?: number;
  timestamp: Date;
}