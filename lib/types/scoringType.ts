export interface PTEAIFeedback {
  pronunciation: number;
  fluency: number;
  content: number;
  grammar: number;
  vocabulary: number;
  spelling: number;
  coherence: number;
  comments: string[];
}

export interface PTEQuestionScore {
  questionId: string;
  questionType: string;
  score: number;
  maxScore: number;
  aiFeedback?: PTEAIFeedback;
}

export interface PTEScores {
  overall: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  communicativeSkills: {
    [key: string]: number;
  };
  questionScores: {
    [questionId: number]: PTEQuestionScore;
  };
}
