export const READING_QUESTION_TYPES = {
  MULTIPLE_CHOICE_SINGLE: "multiple_choice_single",
  MULTIPLE_CHOICE_MULTIPLE: "multiple_choice_multiple",
  REORDER_PARAGRAPHS: "reorder_paragraphs",
  FILL_BLANKS_DROPDOWN: "fill_in_the_blanks_dropdown",
  FILL_BLANKS_DRAG: "fill_in_the_blanks_drag",
} as const;

export type ReadingQuestionTypeCode =
  (typeof READING_QUESTION_TYPES)[keyof typeof READING_QUESTION_TYPES];
