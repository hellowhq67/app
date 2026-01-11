import { QuestionType } from "@/lib/types";

/**
 * Maximum possible RAW points for each PTE Question Type.
 * This is the denominator for normalization in the scoring engine.
 * 
 * Some types have dynamic max scores based on items (e.g. blanks).
 * Those are marked with -1 or handled dynamically in the pipeline.
 * 
 * Based on PTE Official Score Guide.
 */
export const MAX_RAW_SCORES: Partial<Record<QuestionType, number>> = {
    // SPEAKING
    [QuestionType.READ_ALOUD]: 15,          // Content(5) + Pron(5) + Fluency(5)
    [QuestionType.REPEAT_SENTENCE]: 13,     // Content(3) + Pron(5) + Fluency(5)
    [QuestionType.DESCRIBE_IMAGE]: 15,      // Content(5) + Pron(5) + Fluency(5)
    [QuestionType.RE_TELL_LECTURE]: 15,     // Content(5) + Pron(5) + Fluency(5)
    [QuestionType.ANSWER_SHORT_QUESTION]: 1, // 1 point for correct answer

    // WRITING
    [QuestionType.SUMMARIZE_WRITTEN_TEXT]: 7, // Content(2) + Form(1) + Grammar(2) + Vocab(2)
    [QuestionType.WRITE_ESSAY]: 15,           // Content(3) + Form(2) + Grammar(2) + Vocab(2) + Spelling(2) + Structure(2) + Consistency(2)? Check prompt. Prompt says 15.

    // READING (Dynamic usually, but listing defaults/bases if any)
    [QuestionType.MULTIPLE_CHOICE_SINGLE]: 1,
    [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: -1, // Dynamic: +1 correct, -1 incorrect
    [QuestionType.REORDER_PARAGRAPHS]: -1,       // Dynamic: pairs
    [QuestionType.READING_BLANKS]: -1,           // Dynamic: blanks
    [QuestionType.READING_WRITING_BLANKS]: -1,   // Dynamic: blanks

    // LISTENING
    [QuestionType.SUMMARIZE_SPOKEN_TEXT]: 10,     // Content(2) + Form(2) + Grammar(2) + Vocab(2) + Spelling(2)
    [QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE]: 1,
    [QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE]: -1,
    [QuestionType.LISTENING_BLANKS]: -1,
    [QuestionType.HIGHLIGHT_CORRECT_SUMMARY]: 1,
    [QuestionType.SELECT_MISSING_WORD]: 1,
    [QuestionType.HIGHLIGHT_INCORRECT_WORDS]: -1, // Dynamic
    [QuestionType.WRITE_FROM_DICTATION]: -1,      // Dynamic: words

    // PTE CORE / OTHERS
    [QuestionType.RESPOND_TO_A_SITUATION]: 15,
    [QuestionType.SUMMARIZE_GROUP_DISCUSSION]: 12, // Content(2) + Pron(5) + Fluency(5)? Prompt check needed.
};
