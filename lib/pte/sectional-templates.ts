import { QuestionType } from "@/lib/types";

export interface QuestionTypeConfig {
    type: QuestionType;
    minCount: number;
    maxCount: number;
}

export interface SectionalTemplate {
    title: string;
    description: string;
    timeLimit?: number; // Estimated meaningful time limit in seconds
    questions: QuestionTypeConfig[];
}

export const SPEAKING_SECTION_TEMPLATE: SectionalTemplate = {
    title: "Speaking Section",
    description: "Complete set of speaking tasks including Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, and Answer Short Question.",
    questions: [
        { type: QuestionType.READ_ALOUD, minCount: 6, maxCount: 7 },
        { type: QuestionType.REPEAT_SENTENCE, minCount: 10, maxCount: 12 },
        { type: QuestionType.DESCRIBE_IMAGE, minCount: 3, maxCount: 4 },
        { type: QuestionType.RE_TELL_LECTURE, minCount: 1, maxCount: 2 },
        { type: QuestionType.ANSWER_SHORT_QUESTION, minCount: 5, maxCount: 6 },
    ]
};

export const WRITING_SECTION_TEMPLATE: SectionalTemplate = {
    title: "Writing Section",
    description: "Tasks assessing your writing skills: Summarize Written Text and Write Essay.",
    questions: [
        { type: QuestionType.SUMMARIZE_WRITTEN_TEXT, minCount: 1, maxCount: 2 },
        { type: QuestionType.WRITE_ESSAY, minCount: 1, maxCount: 2 },
    ]
};

export const READING_SECTION_TEMPLATE: SectionalTemplate = {
    title: "Reading Section",
    description: "Comprehensive reading tasks ranging from Fill in the Blanks to Multiple Choice questions.",
    questions: [
        { type: QuestionType.READING_WRITING_BLANKS, minCount: 5, maxCount: 6 },
        { type: QuestionType.MULTIPLE_CHOICE_MULTIPLE, minCount: 1, maxCount: 2 },
        { type: QuestionType.REORDER_PARAGRAPHS, minCount: 2, maxCount: 3 },
        { type: QuestionType.READING_BLANKS, minCount: 4, maxCount: 5 },
        { type: QuestionType.MULTIPLE_CHOICE_SINGLE, minCount: 1, maxCount: 2 },
    ]
};

export const LISTENING_SECTION_TEMPLATE: SectionalTemplate = {
    title: "Listening Section",
    description: "Full listening module covering Summarize Spoken Text, Dictation, and various comprehension tasks.",
    questions: [
        { type: QuestionType.SUMMARIZE_SPOKEN_TEXT, minCount: 1, maxCount: 2 },
        { type: QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE, minCount: 1, maxCount: 2 },
        { type: QuestionType.LISTENING_BLANKS, minCount: 2, maxCount: 3 },
        { type: QuestionType.HIGHLIGHT_CORRECT_SUMMARY, minCount: 1, maxCount: 2 },
        { type: QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE, minCount: 1, maxCount: 2 },
        { type: QuestionType.SELECT_MISSING_WORD, minCount: 1, maxCount: 2 },
        { type: QuestionType.HIGHLIGHT_INCORRECT_WORDS, minCount: 2, maxCount: 3 },
        { type: QuestionType.WRITE_FROM_DICTATION, minCount: 3, maxCount: 4 },
    ]
};

export const SECTION_TEMPLATES = {
    speaking: SPEAKING_SECTION_TEMPLATE,
    writing: WRITING_SECTION_TEMPLATE,
    reading: READING_SECTION_TEMPLATE,
    listening: LISTENING_SECTION_TEMPLATE,
};
