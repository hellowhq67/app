import { QuestionType, AIFeedbackData } from '@/lib/types';

/**
 * Deterministic Scorer for Objective PTE Question Types.
 * Calculates exact scores based on user input and answer keys.
 * Bypasses AI for 100% accuracy and zero latency.
 */

export function scoreDeterministically(
    type: QuestionType,
    submission: any, // User's answer
    correctAnswer: any // Answer Key from DB
): AIFeedbackData | null {

    // If we don't have an answer key, we can't score deterministically.
    if (!correctAnswer) return null;

    let score = 0;
    let maxScore = 0;
    const feedbackLines: string[] = [];
    let isCorrect = false;

    switch (type) {
        // --- MULTIPLE CHOICE (SINGLE ANSWER) ---
        case QuestionType.MULTIPLE_CHOICE_SINGLE:
        case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
        case QuestionType.HIGHLIGHT_CORRECT_SUMMARY:
        case QuestionType.SELECT_MISSING_WORD:
            // Input: string, Key: string
            const userSingle = typeof submission === 'string' ? submission : submission?.selectedOption;
            const correctSingle = typeof correctAnswer === 'string' ? correctAnswer : correctAnswer?.selectedOption;

            if (userSingle === correctSingle) {
                score = 1;
                feedbackLines.push("Correct answer selected.");
            } else {
                score = 0;
                feedbackLines.push(`Incorrect. Correct answer was: ${correctSingle}`);
            }
            maxScore = 1;
            break;

        // --- MULTIPLE CHOICE (MULTIPLE ANSWERS) ---
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
        case QuestionType.HIGHLIGHT_INCORRECT_WORDS:
            // Input: string[], Key: string[] (or object with options/indices)
            const userMulti = Array.isArray(submission) ? submission : submission?.selectedOptions || [];
            let correctMulti: string[] = [];

            if (Array.isArray(correctAnswer)) {
                correctMulti = correctAnswer;
            } else if (correctAnswer.options) {
                correctMulti = correctAnswer.options;
            } else if (correctAnswer.indices) { // For highlight incorrect words
                correctMulti = correctAnswer.indices;
            }

            maxScore = correctMulti.length; // Max points = number of correct options

            let correctCount = 0;
            let incorrectCount = 0;

            userMulti.forEach((ans: any) => {
                if (correctMulti.includes(ans)) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            });

            // PTE Rule: +1 for correct, -1 for incorrect. Min 0.
            score = Math.max(0, correctCount - incorrectCount);

            feedbackLines.push(`Correctly selected: ${correctCount}. Incorrectly selected: ${incorrectCount}.`);

            // For Highlight Incorrect Words, accuracy is total correct vs total incorrect
            break;

        // --- FILL IN THE BLANKS (DROPDOWN & DRAG-DROP) ---
        case QuestionType.READING_BLANKS: // Drag & Drop
        case QuestionType.READING_WRITING_BLANKS: // Dropdown
        case QuestionType.LISTENING_BLANKS:
            // Input: { [index]: string } or string[], Key: { blanks: { [index]: string } } or array

            // Normalize input to map
            let userBlanks: Record<string, string> = {};
            if (Array.isArray(submission)) {
                submission.forEach((val, idx) => userBlanks[idx] = val);
            } else if (submission?.filledBlanks) {
                userBlanks = submission.filledBlanks;
            } else {
                userBlanks = submission || {};
            }

            // Normalize key
            let correctBlanks: Record<string, string> = {};
            if (correctAnswer.blanks && !Array.isArray(correctAnswer.blanks)) {
                correctBlanks = correctAnswer.blanks;
            } else if (Array.isArray(correctAnswer)) {
                correctAnswer.forEach((val: string, idx: number) => correctBlanks[idx] = val);
            }

            score = 0;
            maxScore = Object.keys(correctBlanks).length;

            Object.keys(correctBlanks).forEach(key => {
                const correctVal = correctBlanks[key];
                const userVal = userBlanks[key];
                if (userVal && userVal.toLowerCase().trim() === correctVal.toLowerCase().trim()) {
                    score++;
                } else {
                    feedbackLines.push(`Blank ${Number(key) + 1}: Incorrect. Expected "${correctVal}".`);
                }
            });

            if (score === maxScore && maxScore > 0) feedbackLines.push("All blanks correct.");
            break;

        // --- RE-ORDER PARAGRAPHS ---
        case QuestionType.REORDER_PARAGRAPHS:
            // Input: string[] (ids/indices), Key: string[] (correct order)
            const userOrder: string[] = Array.isArray(submission) ? submission : submission?.orderedParagraphs || [];
            const correctOrder: string[] = Array.isArray(correctAnswer) ? correctAnswer : correctAnswer?.order || [];

            if (userOrder.length !== correctOrder.length) {
                feedbackLines.push("Paragraph count mismatch.");
            }

            // PTE Rule: 1 point for each correct ADJACENT PAIR.
            // Example: Correct ABCD. User ABDC.
            // Pairs in Correct: AB, BC, CD.
            // Pairs in User: AB (match), BD (no), DC (no). -> Score 1.

            score = 0;
            maxScore = Math.max(0, correctOrder.length - 1);

            if (maxScore > 0) {
                for (let i = 0; i < correctOrder.length - 1; i++) {
                    const paramsPair = correctOrder[i] + "-" + correctOrder[i + 1];
                    // Check if this pair exists in user order
                    // We need to find index of first item in user order
                    const idx = userOrder.indexOf(correctOrder[i]);
                    if (idx !== -1 && idx < userOrder.length - 1) {
                        if (userOrder[idx + 1] === correctOrder[i + 1]) {
                            score++;
                        }
                    }
                }
            }

            feedbackLines.push(`${score}/${maxScore} correct pairs.`);
            break;

        // --- WRITE FROM DICTATION --- 
        // Semi-deterministic: strict word matching
        case QuestionType.WRITE_FROM_DICTATION:
            const userText = (typeof submission === 'string' ? submission : submission?.text || "").toLowerCase();
            const cleanUserWords = userText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);

            const correctText = (typeof correctAnswer === 'string' ? correctAnswer : correctAnswer?.text || "").toLowerCase();
            const cleanCorrectWords = correctText.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);

            score = 0;
            maxScore = cleanCorrectWords.length;

            // PTE Rule: 1 point for each correct word (order doesn't strictly matter as much as presence, but usually sequence helps).
            // Simple set intersection for now (or naive count). PTE actually cares about correct spelling.

            // We'll simplistic match: count how many correct words are present.
            // Note: Duplicates in answer key should be matched individually.
            const userWordCounts = new Map<string, number>();
            cleanUserWords.forEach((w: string) => userWordCounts.set(w, (userWordCounts.get(w) || 0) + 1));

            cleanCorrectWords.forEach((w: string) => {
                if (userWordCounts.has(w) && userWordCounts.get(w)! > 0) {
                    score++;
                    userWordCounts.set(w, userWordCounts.get(w)! - 1);
                }
            });

            feedbackLines.push(`${score}/${maxScore} words correct.`);
            break;

        default:
            return null; // Delegate to AI
    }

    // Construct Feedback Object
    return {
        overallScore: score,
        maxScore,
        accuracy: {
            score: score,
            feedback: feedbackLines.join(" ") || "Evaluated potentially."
        },
        strengths: score === maxScore ? ["Perfect accuracy."] : [],
        areasForImprovement: score < maxScore ? ["Review incorrect answers."] : [],
        suggestions: ["Practice similar questions to improve accuracy."],
    };
}
