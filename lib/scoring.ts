export interface ScoreResult {
  pronunciation?: number;
  fluency?: number;
  content?: number;
  grammar?: number;
  vocabulary?: number;
  spelling?: number;
  overall: number;
  feedback?: string;
  breakdown?: {
    [key: string]: number;
  };
}

export function calculateSpeakingScore(
  audioData: ArrayBuffer,
  expectedText: string
): Promise<ScoreResult> {
  // This would integrate with an AI service like OpenAI Whisper or similar
  // For now, return a mock score
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockScore: ScoreResult = {
        pronunciation: Math.floor(Math.random() * 20) + 75, // 75-95
        fluency: Math.floor(Math.random() * 20) + 75, // 75-95
        content: Math.floor(Math.random() * 25) + 70, // 70-95
        overall: Math.floor(Math.random() * 20) + 75, // 75-95
        feedback: "Good pronunciation and fluency. Try to speak more clearly on difficult words.",
        breakdown: {
          pronunciation: Math.floor(Math.random() * 20) + 75,
          fluency: Math.floor(Math.random() * 20) + 75,
          content: Math.floor(Math.random() * 25) + 70,
        },
      };
      resolve(mockScore);
    }, 1000); // Simulate processing time
  });
}

export function calculateWritingScore(
  writtenText: string,
  expectedText: string,
  prompt: string
): Promise<ScoreResult> {
  // This would integrate with an AI service for writing evaluation
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockScore: ScoreResult = {
        grammar: Math.floor(Math.random() * 20) + 75, // 75-95
        vocabulary: Math.floor(Math.random() * 20) + 75, // 75-95
        content: Math.floor(Math.random() * 25) + 70, // 70-95
        spelling: Math.floor(Math.random() * 15) + 85, // 85-100
        overall: Math.floor(Math.random() * 20) + 75, // 75-95
        feedback: "Well-structured response with good vocabulary. Check for minor grammatical errors.",
        breakdown: {
          grammar: Math.floor(Math.random() * 20) + 75,
          vocabulary: Math.floor(Math.random() * 20) + 75,
          content: Math.floor(Math.random() * 25) + 70,
          spelling: Math.floor(Math.random() * 15) + 85,
        },
      };
      resolve(mockScore);
    }, 800); // Simulate processing time
  });
}

export function calculateReadingScore(
  selectedAnswers: string[],
  correctAnswers: string[]
): ScoreResult {
  const correctCount = selectedAnswers.filter(
    (answer, index) => answer === correctAnswers[index]
  ).length;
  const totalQuestions = correctAnswers.length;
  const accuracy = (correctCount / totalQuestions) * 100;

  return {
    overall: Math.round(accuracy),
    feedback: `You got ${correctCount} out of ${totalQuestions} questions correct.`,
    breakdown: {
      accuracy: Math.round(accuracy),
      correct: correctCount,
      total: totalQuestions,
    },
  };
}

export function calculateListeningScore(
  userTranscription: string,
  correctTranscription: string
): ScoreResult {
  // Simple word-level comparison for demonstration
  const userWords = userTranscription.toLowerCase().split(/\s+/);
  const correctWords = correctTranscription.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const word of userWords) {
    if (correctWords.includes(word)) {
      matches++;
    }
  }
  
  const accuracy = userWords.length > 0 ? (matches / userWords.length) * 100 : 0;

  return {
    overall: Math.round(accuracy),
    feedback: `Transcription accuracy: ${Math.round(accuracy)}%. Try to listen more carefully for specific words.`,
    breakdown: {
      accuracy: Math.round(accuracy),
      matches,
      total: userWords.length,
    },
  };
}

export function getScoreGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "Excellent", color: "text-green-600" };
  if (score >= 79) return { grade: "Good", color: "text-blue-600" };
  if (score >= 65) return { grade: "Fair", color: "text-yellow-600" };
  if (score >= 50) return { grade: "Poor", color: "text-orange-600" };
  return { grade: "Very Poor", color: "text-red-600" };
}

export function getScoreFeedback(score: number, skill: string): string {
  const feedbackMap: { [key: string]: { [key: number]: string } } = {
    speaking: {
      90: "Excellent pronunciation and fluency!",
      79: "Good speaking skills. Minor improvements needed.",
      65: "Fair performance. Practice pronunciation and pace.",
      50: "Needs significant improvement in speaking skills.",
      0: "Consider working with a speaking coach.",
    },
    writing: {
      90: "Outstanding writing with excellent structure.",
      79: "Good writing with minor grammatical issues.",
      65: "Fair writing. Work on grammar and vocabulary.",
      50: "Writing needs substantial improvement.",
      0: "Focus on basic writing skills and grammar.",
    },
    reading: {
      90: "Excellent reading comprehension!",
      79: "Good understanding of the text.",
      65: "Fair comprehension. Read more carefully.",
      50: "Poor reading comprehension. Practice regularly.",
      0: "Significant improvement needed in reading skills.",
    },
    listening: {
      90: "Perfect listening skills!",
      79: "Good listening comprehension.",
      65: "Fair listening. Focus on key details.",
      50: "Poor listening skills. Practice active listening.",
      0: "Needs extensive listening practice.",
    },
  };

  const thresholds = [90, 79, 65, 50, 0];
  const skillFeedback = feedbackMap[skill] || feedbackMap.speaking;
  
  for (const threshold of thresholds) {
    if (score >= threshold) {
      return skillFeedback[threshold];
    }
  }
  
  return "Keep practicing to improve your skills.";
}
