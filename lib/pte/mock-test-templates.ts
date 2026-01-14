import { QuestionType } from "@/lib/types";
import { QuestionTypeConfig } from "./sectional-templates";

export interface MockTestSections {
    speaking: QuestionTypeConfig[];
    writing: QuestionTypeConfig[];
    reading: QuestionTypeConfig[];
    listening: QuestionTypeConfig[];
}

export interface MockTestTemplate {
    name: string;
    description: string;
    sections: MockTestSections;
}

export const FULL_MOCK_TEST_TEMPLATE: MockTestTemplate = {
    name: "Full PTE Academic Mock Test",
    description: "A complete simulation of the 2-hour PTE Academic exam including all 4 communicative skills.",
    sections: {
        speaking: [
            { type: QuestionType.READ_ALOUD, minCount: 6, maxCount: 7 },
            { type: QuestionType.REPEAT_SENTENCE, minCount: 10, maxCount: 12 },
            { type: QuestionType.DESCRIBE_IMAGE, minCount: 3, maxCount: 4 },
            { type: QuestionType.RE_TELL_LECTURE, minCount: 1, maxCount: 2 },
            { type: QuestionType.ANSWER_SHORT_QUESTION, minCount: 5, maxCount: 6 },
        ],
        writing: [
            { type: QuestionType.SUMMARIZE_WRITTEN_TEXT, minCount: 1, maxCount: 2 },
            { type: QuestionType.WRITE_ESSAY, minCount: 1, maxCount: 2 },
        ],
        reading: [
            { type: QuestionType.READING_WRITING_BLANKS, minCount: 5, maxCount: 6 },
            { type: QuestionType.MULTIPLE_CHOICE_MULTIPLE, minCount: 1, maxCount: 2 },
            { type: QuestionType.REORDER_PARAGRAPHS, minCount: 2, maxCount: 3 },
            { type: QuestionType.READING_BLANKS, minCount: 4, maxCount: 5 },
            { type: QuestionType.MULTIPLE_CHOICE_SINGLE, minCount: 1, maxCount: 2 },
        ],
        listening: [
            { type: QuestionType.SUMMARIZE_SPOKEN_TEXT, minCount: 1, maxCount: 2 },
            { type: QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE, minCount: 1, maxCount: 2 },
            { type: QuestionType.LISTENING_BLANKS, minCount: 2, maxCount: 3 },
            { type: QuestionType.HIGHLIGHT_CORRECT_SUMMARY, minCount: 1, maxCount: 2 },
            { type: QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE, minCount: 1, maxCount: 2 },
            { type: QuestionType.SELECT_MISSING_WORD, minCount: 1, maxCount: 2 },
            { type: QuestionType.HIGHLIGHT_INCORRECT_WORDS, minCount: 2, maxCount: 3 },
            { type: QuestionType.WRITE_FROM_DICTATION, minCount: 3, maxCount: 4 },
        ]
    }
};
