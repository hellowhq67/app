/**
 * Deterministic Scoring for Reading and Listening Questions
 *
 * These question types have correct answers that can be scored
 * without AI/LLM evaluation - just answer comparison.
 */

import { AIFeedbackData, QuestionType } from '@/lib/types';

// Question types that use deterministic scoring
const DETERMINISTIC_QUESTION_TYPES = [
  'multiple_choice_single',
  'multiple_choice_multiple',
  'reading_writing_fill_blanks',
  'reading_fill_blanks',
  'reorder_paragraphs',
  'listening_fill_blanks',
  'highlight_incorrect_words',
  'write_from_dictation',
  'select_missing_word',
  'highlight_correct_summary',
];

export function isDeterministicQuestion(type: string): boolean {
  const normalizedType = type.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
  return DETERMINISTIC_QUESTION_TYPES.some(t =>
    normalizedType.includes(t) || t.includes(normalizedType)
  );
}

interface ScoringResult {
  score: number;          // 0-90 PTE scale
  correct: number;
  total: number;
  feedback: string;
  details?: Record<string, unknown>;
}

/**
 * Score Multiple Choice Single Answer
 * 1 point for correct, 0 for incorrect
 */
export function scoreMCQSingle(
  userAnswer: string,
  correctAnswer: string
): ScoringResult {
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  return {
    score: isCorrect ? 90 : 10,
    correct: isCorrect ? 1 : 0,
    total: 1,
    feedback: isCorrect
      ? 'Correct! You selected the right answer.'
      : `Incorrect. The correct answer was: ${correctAnswer}`,
  };
}

/**
 * Score Multiple Choice Multiple Answers
 * +1 for each correct selection, -1 for each incorrect selection
 * Minimum score is 0 (no negative total)
 */
export function scoreMCQMultiple(
  userAnswers: string[],
  correctAnswers: string[]
): ScoringResult {
  const userSet = new Set(userAnswers.map(a => a.trim().toLowerCase()));
  const correctSet = new Set(correctAnswers.map(a => a.trim().toLowerCase()));

  let score = 0;
  let correctCount = 0;

  // Points for correct selections
  userSet.forEach(answer => {
    if (correctSet.has(answer)) {
      score += 1;
      correctCount += 1;
    } else {
      score -= 1; // Penalty for wrong selection
    }
  });

  // Ensure minimum score is 0
  score = Math.max(0, score);

  // Convert to PTE scale (0-90)
  const maxScore = correctAnswers.length;
  const pteScore = Math.round(10 + (score / maxScore) * 80);

  const missed = correctAnswers.filter(a => !userSet.has(a.toLowerCase()));

  return {
    score: pteScore,
    correct: correctCount,
    total: correctAnswers.length,
    feedback: correctCount === correctAnswers.length
      ? 'Perfect! You identified all correct answers.'
      : `You got ${correctCount} of ${correctAnswers.length} correct.${missed.length > 0 ? ` Missed: ${missed.join(', ')}` : ''}`,
    details: { missed, selected: Array.from(userSet) },
  };
}

/**
 * Score Reorder Paragraphs
 * Uses "correct pairs" method - counts adjacent pairs in correct order
 */
export function scoreReorderParagraphs(
  userOrder: string[],
  correctOrder: string[]
): ScoringResult {
  if (userOrder.length !== correctOrder.length) {
    return {
      score: 10,
      correct: 0,
      total: correctOrder.length - 1,
      feedback: 'Incorrect number of paragraphs submitted.',
    };
  }

  let correctPairs = 0;
  const totalPairs = correctOrder.length - 1;

  // Count correct adjacent pairs
  for (let i = 0; i < totalPairs; i++) {
    const userPair = `${userOrder[i]}-${userOrder[i + 1]}`;
    const correctPair = `${correctOrder[i]}-${correctOrder[i + 1]}`;
    if (userPair === correctPair) {
      correctPairs++;
    }
  }

  const pteScore = Math.round(10 + (correctPairs / totalPairs) * 80);

  return {
    score: pteScore,
    correct: correctPairs,
    total: totalPairs,
    feedback: correctPairs === totalPairs
      ? 'Perfect! All paragraphs are in the correct order.'
      : `You got ${correctPairs} of ${totalPairs} pairs in the correct order.`,
    details: { userOrder, correctOrder },
  };
}

/**
 * Score Fill in the Blanks (Reading or Listening)
 * 1 point per correct blank
 */
export function scoreFillBlanks(
  userAnswers: Record<string, string>,
  correctAnswers: Record<string, string>
): ScoringResult {
  let correct = 0;
  const total = Object.keys(correctAnswers).length;
  const mistakes: string[] = [];

  Object.entries(correctAnswers).forEach(([blank, correctAnswer]) => {
    const userAnswer = userAnswers[blank]?.trim().toLowerCase() || '';
    const correct_lower = correctAnswer.trim().toLowerCase();

    if (userAnswer === correct_lower) {
      correct++;
    } else {
      mistakes.push(`Blank ${blank}: Expected "${correctAnswer}", got "${userAnswers[blank] || '(empty)'}"`,);
    }
  });

  const pteScore = total > 0 ? Math.round(10 + (correct / total) * 80) : 10;

  return {
    score: pteScore,
    correct,
    total,
    feedback: correct === total
      ? 'Perfect! All blanks filled correctly.'
      : `You got ${correct} of ${total} blanks correct.`,
    details: { mistakes },
  };
}

/**
 * Score Write from Dictation
 * 1 point per correctly transcribed word (case-insensitive)
 */
export function scoreWriteFromDictation(
  userText: string,
  correctText: string
): ScoringResult {
  const userWords = userText.toLowerCase().split(/\s+/).filter(Boolean);
  const correctWords = correctText.toLowerCase().split(/\s+/).filter(Boolean);

  let correct = 0;
  const total = correctWords.length;

  // Simple word matching (could be enhanced with Levenshtein distance)
  correctWords.forEach((word, i) => {
    if (userWords[i] === word) {
      correct++;
    }
  });

  // Also check for words that appear but in wrong position
  const userWordSet = new Set(userWords);
  const partialCredit = correctWords.filter(w => userWordSet.has(w)).length;

  // Use the higher of exact position or partial credit
  const effectiveCorrect = Math.max(correct, Math.floor(partialCredit * 0.8));

  const pteScore = total > 0 ? Math.round(10 + (effectiveCorrect / total) * 80) : 10;

  return {
    score: pteScore,
    correct: effectiveCorrect,
    total,
    feedback: effectiveCorrect === total
      ? 'Perfect transcription!'
      : `You got ${effectiveCorrect} of ${total} words correct.`,
    details: {
      exactMatches: correct,
      wordsInWrongPosition: partialCredit - correct,
      userText,
      correctText,
    },
  };
}

/**
 * Score Highlight Incorrect Words
 * 1 point per correctly identified incorrect word
 * -1 point per incorrectly highlighted word
 */
export function scoreHighlightIncorrectWords(
  highlightedWords: string[],
  incorrectWords: string[]
): ScoringResult {
  const highlightedSet = new Set(highlightedWords.map(w => w.toLowerCase()));
  const incorrectSet = new Set(incorrectWords.map(w => w.toLowerCase()));

  let score = 0;
  let correct = 0;

  // Points for correctly identified incorrect words
  highlightedSet.forEach(word => {
    if (incorrectSet.has(word)) {
      score += 1;
      correct += 1;
    } else {
      score -= 1; // Penalty for highlighting correct words
    }
  });

  // Ensure minimum score is 0
  score = Math.max(0, score);

  const total = incorrectWords.length;
  const pteScore = total > 0 ? Math.round(10 + (score / total) * 80) : 10;

  const missed = incorrectWords.filter(w => !highlightedSet.has(w.toLowerCase()));

  return {
    score: pteScore,
    correct,
    total,
    feedback: correct === total && score === total
      ? 'Perfect! You identified all incorrect words without false positives.'
      : `You correctly identified ${correct} of ${total} incorrect words.${missed.length > 0 ? ` Missed: ${missed.join(', ')}` : ''}`,
    details: { missed, highlighted: Array.from(highlightedSet) },
  };
}

/**
 * Convert deterministic scoring result to AIFeedbackData format
 */
export function toAIFeedbackData(
  result: ScoringResult,
  questionType: string
): AIFeedbackData {
  const isGood = result.score >= 70;
  const isAverage = result.score >= 40 && result.score < 70;

  return {
    overallScore: result.score,
    content: {
      score: result.score,
      feedback: result.feedback,
    },
    accuracy: {
      score: result.score,
      feedback: `${result.correct}/${result.total} correct`,
    },
    suggestions: isGood
      ? ['Keep practicing to maintain accuracy!']
      : isAverage
        ? ['Review the question carefully before answering.', 'Practice similar questions to improve accuracy.']
        : ['Focus on understanding the question requirements.', 'Take your time to analyze all options.', 'Practice more questions of this type.'],
    strengths: result.correct > 0
      ? [`Correctly answered ${result.correct} out of ${result.total}`]
      : [],
    areasForImprovement: result.correct < result.total
      ? [`Missed ${result.total - result.correct} answer(s)`]
      : [],
    scoringMetrics: {
      lexicalScore: 0, // Not applicable for deterministic
      semanticScore: 0, // Not applicable for deterministic
      fluencyScore: 0, // Not applicable for deterministic
      calculatedPteScore: result.score,
      confidence: 100, // Deterministic scoring is 100% confident
    },
  };
}

/**
 * Main deterministic scoring function
 * Routes to appropriate scoring function based on question type
 */
export function scoreDeterministic(
  questionType: string,
  userSubmission: {
    selectedOption?: string;
    selectedOptions?: string[];
    orderedParagraphs?: string[];
    filledBlanks?: Record<string, string>;
    highlightedWords?: string[];
    textAnswer?: string;
  },
  correctAnswer: {
    correctOption?: string;
    correctOptions?: string[];
    correctOrder?: string[];
    correctBlanks?: Record<string, string>;
    incorrectWords?: string[];
    correctText?: string;
  }
): AIFeedbackData | null {
  const normalizedType = questionType.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');

  let result: ScoringResult | null = null;

  // MCQ Single
  if (normalizedType.includes('single') && userSubmission.selectedOption && correctAnswer.correctOption) {
    result = scoreMCQSingle(userSubmission.selectedOption, correctAnswer.correctOption);
  }
  // MCQ Multiple
  else if (normalizedType.includes('multiple') && userSubmission.selectedOptions && correctAnswer.correctOptions) {
    result = scoreMCQMultiple(userSubmission.selectedOptions, correctAnswer.correctOptions);
  }
  // Reorder Paragraphs
  else if (normalizedType.includes('reorder') && userSubmission.orderedParagraphs && correctAnswer.correctOrder) {
    result = scoreReorderParagraphs(userSubmission.orderedParagraphs, correctAnswer.correctOrder);
  }
  // Fill in Blanks
  else if (normalizedType.includes('blank') && userSubmission.filledBlanks && correctAnswer.correctBlanks) {
    result = scoreFillBlanks(userSubmission.filledBlanks, correctAnswer.correctBlanks);
  }
  // Highlight Incorrect Words
  else if (normalizedType.includes('highlight_incorrect') && userSubmission.highlightedWords && correctAnswer.incorrectWords) {
    result = scoreHighlightIncorrectWords(userSubmission.highlightedWords, correctAnswer.incorrectWords);
  }
  // Write from Dictation
  else if (normalizedType.includes('dictation') && userSubmission.textAnswer && correctAnswer.correctText) {
    result = scoreWriteFromDictation(userSubmission.textAnswer, correctAnswer.correctText);
  }
  // Highlight Correct Summary / Select Missing Word (MCQ Single variants)
  else if ((normalizedType.includes('highlight_correct') || normalizedType.includes('select_missing')) && userSubmission.selectedOption && correctAnswer.correctOption) {
    result = scoreMCQSingle(userSubmission.selectedOption, correctAnswer.correctOption);
  }

  if (result) {
    return toAIFeedbackData(result, questionType);
  }

  return null; // Not a deterministic question type
}
