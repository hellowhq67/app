
import { QuestionType } from "@/lib/types";

export const PTE_MASTER_BLUEPRINT = {
    version: "2025.1",
    total_time_minutes: { min: 120, max: 138 },
    sections: [
        {
            id: "speaking_writing",
            title: "Part 1: Speaking & Writing",
            total_time_minutes: { min: 54, max: 67 },
            tasks: [
                {
                    type: QuestionType.PERSONAL_INTRODUCTION,
                    count: { min: 1, max: 1 },
                    scored: false,
                    timing: { response_seconds: 30 }
                },
                {
                    type: QuestionType.READ_ALOUD,
                    count: { min: 6, max: 7 },
                    scored: true,
                    timing: { prep_seconds: 30, speak_seconds_range: [30, 40] }
                },
                {
                    type: QuestionType.REPEAT_SENTENCE,
                    count: { min: 10, max: 12 },
                    scored: true,
                    timing: { audio_seconds_range: [3, 9], response_seconds: 15 }
                },
                {
                    type: QuestionType.DESCRIBE_IMAGE,
                    count: { min: 3, max: 4 },
                    scored: true,
                    timing: { prep_seconds: 25, speak_seconds: 40 }
                },
                {
                    type: QuestionType.RE_TELL_LECTURE,
                    count: { min: 1, max: 2 },
                    scored: true,
                    timing: { audio_seconds_range: [60, 90], prep_seconds: 10, speak_seconds: 40 }
                },
                {
                    type: QuestionType.ANSWER_SHORT_QUESTION,
                    count: { min: 5, max: 6 },
                    scored: true,
                    timing: { response_seconds: 10 }
                },
                {
                    type: QuestionType.SUMMARIZE_WRITTEN_TEXT,
                    count: { min: 1, max: 2 },
                    scored: true,
                    timing: { time_minutes: 10, word_limit_range: [5, 75] }
                },
                {
                    type: QuestionType.WRITE_ESSAY,
                    count: { min: 1, max: 1 },
                    scored: true,
                    timing: { time_minutes: 20, word_limit_range: [200, 300] }
                }
            ]
        },
        {
            id: "reading",
            title: "Part 2: Reading",
            total_time_minutes: { min: 29, max: 30 },
            tasks: [
                {
                    type: QuestionType.READING_WRITING_BLANKS,
                    count: { min: 5, max: 6 },
                    scored: true
                },
                {
                    type: QuestionType.MULTIPLE_CHOICE_MULTIPLE, // Need to verify if this is Reading or Listening specific in Types
                    count: { min: 1, max: 2 },
                    scored: true
                },
                {
                    type: QuestionType.REORDER_PARAGRAPHS,
                    count: { min: 2, max: 3 },
                    scored: true
                },
                {
                    type: QuestionType.READING_BLANKS,
                    count: { min: 4, max: 5 },
                    scored: true
                },
                {
                    type: QuestionType.MULTIPLE_CHOICE_SINGLE, // Check types
                    count: { min: 1, max: 2 },
                    scored: true
                }
            ]
        },
        {
            id: "listening",
            title: "Part 3: Listening",
            total_time_minutes: { min: 30, max: 43 },
            tasks: [
                {
                    type: QuestionType.SUMMARIZE_SPOKEN_TEXT,
                    count: { min: 1, max: 2 },
                    scored: true,
                    timing: { time_minutes: 10, word_limit_range: [50, 70] }
                },
                {
                    type: QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE,
                    count: { min: 1, max: 2 },
                    scored: true
                },
                {
                    type: QuestionType.LISTENING_BLANKS,
                    count: { min: 2, max: 3 },
                    scored: true
                },
                {
                    type: QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
                    count: { min: 1, max: 2 },
                    scored: true
                },
                {
                    type: QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
                    count: { min: 1, max: 2 },
                    scored: true
                },
                {
                    type: QuestionType.SELECT_MISSING_WORD,
                    count: { min: 1, max: 2 },
                    scored: true
                },
                {
                    type: QuestionType.HIGHLIGHT_INCORRECT_WORDS,
                    count: { min: 2, max: 3 },
                    scored: true
                },
                {
                    type: QuestionType.WRITE_FROM_DICTATION,
                    count: { min: 3, max: 4 },
                    scored: true
                }
            ]
        }
    ]
};
