import { QuestionType } from '@/lib/types';
import { ContributionMatrix } from './types';

/**
 * PTE Scoring Configuration
 * Defines how each task contributes to the Communicative Skills.
 * Weights are approximate based on standard PTE scoring models.
 */

export const PTE_CONTRIBUTION_MATRIX: ContributionMatrix = {
    // SPEAKING
    [QuestionType.READ_ALOUD]: { speaking: 0.5, reading: 0.5, writing: 0, listening: 0 },
    [QuestionType.REPEAT_SENTENCE]: { speaking: 0.5, listening: 0.5, writing: 0, reading: 0 },
    [QuestionType.DESCRIBE_IMAGE]: { speaking: 1.0, listening: 0, writing: 0, reading: 0 },
    [QuestionType.RE_TELL_LECTURE]: { speaking: 0.5, listening: 0.5, writing: 0, reading: 0 }, // Often Listening > Speaking slightly, but 50/50 is standard approx
    [QuestionType.ANSWER_SHORT_QUESTION]: { speaking: 0.3, listening: 0.7, writing: 0, reading: 0 }, // Heavy Listening weight
    [QuestionType.RESPOND_TO_A_SITUATION]: { speaking: 1.0, listening: 0, writing: 0, reading: 0 }, // PTE Core / New
    [QuestionType.SUMMARIZE_GROUP_DISCUSSION]: { speaking: 0.5, listening: 0.5, writing: 0, reading: 0 }, // PTE Core / New

    // WRITING
    [QuestionType.SUMMARIZE_WRITTEN_TEXT]: { writing: 0.5, reading: 0.5, speaking: 0, listening: 0 },
    [QuestionType.WRITE_ESSAY]: { writing: 1.0, reading: 0, speaking: 0, listening: 0 },

    // READING
    [QuestionType.READING_WRITING_BLANKS]: { reading: 0.5, writing: 0.5, speaking: 0, listening: 0 },
    [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: { reading: 1.0, writing: 0, speaking: 0, listening: 0 },
    [QuestionType.REORDER_PARAGRAPHS]: { reading: 1.0, writing: 0, speaking: 0, listening: 0 },
    [QuestionType.READING_BLANKS]: { reading: 1.0, writing: 0, speaking: 0, listening: 0 },
    [QuestionType.MULTIPLE_CHOICE_SINGLE]: { reading: 1.0, writing: 0, speaking: 0, listening: 0 },

    // LISTENING
    [QuestionType.SUMMARIZE_SPOKEN_TEXT]: { listening: 0.5, writing: 0.5, speaking: 0, reading: 0 },
    [QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE]: { listening: 1.0, writing: 0, speaking: 0, reading: 0 },
    [QuestionType.LISTENING_BLANKS]: { listening: 0.5, writing: 0.5, speaking: 0, reading: 0 }, // Spelling counts for writing
    [QuestionType.HIGHLIGHT_CORRECT_SUMMARY]: { listening: 0.5, reading: 0.5, speaking: 0, writing: 0 },
    [QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE]: { listening: 1.0, writing: 0, speaking: 0, reading: 0 },
    [QuestionType.SELECT_MISSING_WORD]: { listening: 1.0, writing: 0, speaking: 0, reading: 0 },
    [QuestionType.HIGHLIGHT_INCORRECT_WORDS]: { listening: 0.5, reading: 0.5, speaking: 0, writing: 0 },
    [QuestionType.WRITE_FROM_DICTATION]: { listening: 0.5, writing: 0.5, speaking: 0, reading: 0 },
    [QuestionType.WRITE_EMAIL]: { writing: 1.0, reading: 0, speaking: 0, listening: 0 },
    [QuestionType.PERSONAL_INTRODUCTION]: { speaking: 0, listening: 0, writing: 0, reading: 0 },
};

/**
 * Task Importance (Used for Overall Score calculation)
 * These weights determine how much each section impacts the global score.
 */
export const SECTION_IMPORTANCE = {
    SPEAKING: 0.35,
    WRITING: 0.20, // Slightly less weight
    READING: 0.20,
    LISTENING: 0.25,
};
