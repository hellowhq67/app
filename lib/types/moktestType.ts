import { PTE_QUESTION_TYPES } from "@/constants/pte-constants";

export type SectionType = "speaking" | "writing" | "reading" | "listening";

export type AllTestTypes = 
  // Speaking
  | typeof PTE_QUESTION_TYPES.READ_ALOUD
  | typeof PTE_QUESTION_TYPES.REPEAT_SENTENCE
  | typeof PTE_QUESTION_TYPES.DESCRIBE_IMAGE
  | typeof PTE_QUESTION_TYPES.RETELL_LECTURE
  | typeof PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION
  | typeof PTE_QUESTION_TYPES.RESPOND_TO_SITUATION
  | typeof PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION
  // Writing
  | typeof PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT
  | typeof PTE_QUESTION_TYPES.ESSAY
  // Reading
  | typeof PTE_QUESTION_TYPES.FILL_IN_BLANKS_DROPDOWN
  | typeof PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING
  | typeof PTE_QUESTION_TYPES.REORDER_PARAGRAPHS
  | typeof PTE_QUESTION_TYPES.FILL_IN_BLANKS_DRAG_DROP
  | typeof PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_READING
  // Listening
  | typeof PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT
  | typeof PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_LISTENING
  | typeof PTE_QUESTION_TYPES.FILL_IN_BLANKS_LISTENING
  | typeof PTE_QUESTION_TYPES.HIGHLIGHT_CORRECT_SUMMARY
  | typeof PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_LISTENING
  | typeof PTE_QUESTION_TYPES.SELECT_MISSING_WORD
  | typeof PTE_QUESTION_TYPES.HIGHLIGHT_INCORRECT_WORDS
  | typeof PTE_QUESTION_TYPES.WRITE_FROM_DICTATION;

export interface PracticeSessionProps {
  initialSection?: SectionType;
}

export const LESSONS = [
  // Speaking (7)
  { code: PTE_QUESTION_TYPES.READ_ALOUD, category: "speaking" },
  { code: PTE_QUESTION_TYPES.REPEAT_SENTENCE, category: "speaking" },
  { code: PTE_QUESTION_TYPES.DESCRIBE_IMAGE, category: "speaking" },
  { code: PTE_QUESTION_TYPES.RETELL_LECTURE, category: "speaking" },
  { code: PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION, category: "speaking" },
  { code: PTE_QUESTION_TYPES.RESPOND_TO_SITUATION, category: "speaking" },
  { code: PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION, category: "speaking" },

  // Writing (2)
  { code: PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT, category: "writing" },
  { code: PTE_QUESTION_TYPES.ESSAY, category: "writing" },

  // Reading (5)
  { code: PTE_QUESTION_TYPES.FILL_IN_BLANKS_DROPDOWN, category: "reading" },
  { code: PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING, category: "reading" },
  { code: PTE_QUESTION_TYPES.REORDER_PARAGRAPHS, category: "reading" },
  { code: PTE_QUESTION_TYPES.FILL_IN_BLANKS_DRAG_DROP, category: "reading" },
  { code: PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_READING, category: "reading" },

  // Listening (8)
  { code: PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT, category: "listening" },
  { code: PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_LISTENING, category: "listening" },
  { code: PTE_QUESTION_TYPES.FILL_IN_BLANKS_LISTENING, category: "listening" },
  { code: PTE_QUESTION_TYPES.HIGHLIGHT_CORRECT_SUMMARY, category: "listening" },
  { code: PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_LISTENING, category: "listening" },
  { code: PTE_QUESTION_TYPES.SELECT_MISSING_WORD, category: "listening" },
  { code: PTE_QUESTION_TYPES.HIGHLIGHT_INCORRECT_WORDS, category: "listening" },
  { code: PTE_QUESTION_TYPES.WRITE_FROM_DICTATION, category: "listening" },
];

export interface MockTestQuestion {
  id: string
  title: string
  content: string
  type: string
  duration: number
}

export interface MockTestSection {
  name: string
  questions: MockTestQuestion[]
}

export interface MockTest {
  id: string
  title: string
  duration: number
  sections: MockTestSection[]
  status?: string
}

export interface MockTestSimulatorProps {
  mockTest: MockTest
}
