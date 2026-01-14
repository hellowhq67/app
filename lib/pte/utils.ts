import { QuestionType } from '@/lib/types';

/**
 * Map URL slug / database code to QuestionType enum
 */
export const TYPE_CODE_TO_ENUM: Record<string, QuestionType> = {
    // Speaking
    'read_aloud': QuestionType.READ_ALOUD,
    'repeat_sentence': QuestionType.REPEAT_SENTENCE,
    'describe_image': QuestionType.DESCRIBE_IMAGE,
    'retell_lecture': QuestionType.RE_TELL_LECTURE,
    'answer_short_question': QuestionType.ANSWER_SHORT_QUESTION,
    'respond_to_situation': QuestionType.RESPOND_TO_A_SITUATION,
    'summarize_group_discussion': QuestionType.SUMMARIZE_GROUP_DISCUSSION,

    // Writing
    'summarize_written_text': QuestionType.SUMMARIZE_WRITTEN_TEXT,
    'write_essay': QuestionType.WRITE_ESSAY,

    // Reading
    'reading_mc_single': QuestionType.MULTIPLE_CHOICE_SINGLE,
    'reading_mc_multiple': QuestionType.MULTIPLE_CHOICE_MULTIPLE,
    'reorder_paragraphs': QuestionType.REORDER_PARAGRAPHS,
    'reading_fill_blanks_dropdown': QuestionType.READING_WRITING_BLANKS,
    'reading_fill_blanks_drag': QuestionType.READING_BLANKS,

    // Listening
    'summarize_spoken_text': QuestionType.SUMMARIZE_SPOKEN_TEXT,
    'multiple_choice_multiple': QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE,
    'listening_mc_multiple': QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE,
    'fill_blanks': QuestionType.LISTENING_BLANKS,
    'highlight_correct_summary': QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
    'multiple_choice_single': QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
    'listening_mc_single': QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
    'select_missing_word': QuestionType.SELECT_MISSING_WORD,
    'highlight_incorrect_words': QuestionType.HIGHLIGHT_INCORRECT_WORDS,
    'write_from_dictation': QuestionType.WRITE_FROM_DICTATION,
};

/**
 * Convert a code/slug to QuestionType enum
 */
export function codeToQuestionType(code: string): QuestionType | null {
    return TYPE_CODE_TO_ENUM[code] || null;
}

/**
 * Get section from question type
 */
export function getSectionFromQuestionType(type: QuestionType | string): 'Speaking' | 'Writing' | 'Reading' | 'Listening' {
    const typeStr = typeof type === 'string' ? type : type;

    // Speaking types
    if ([
        QuestionType.READ_ALOUD,
        QuestionType.REPEAT_SENTENCE,
        QuestionType.DESCRIBE_IMAGE,
        QuestionType.RE_TELL_LECTURE,
        QuestionType.ANSWER_SHORT_QUESTION,
        QuestionType.RESPOND_TO_A_SITUATION,
        QuestionType.SUMMARIZE_GROUP_DISCUSSION,
    ].includes(typeStr as QuestionType)) {
        return 'Speaking';
    }

    // Writing types
    if ([
        QuestionType.SUMMARIZE_WRITTEN_TEXT,
        QuestionType.WRITE_ESSAY,
    ].includes(typeStr as QuestionType)) {
        return 'Writing';
    }

    // Reading types
    if ([
        QuestionType.MULTIPLE_CHOICE_SINGLE,
        QuestionType.MULTIPLE_CHOICE_MULTIPLE,
        QuestionType.REORDER_PARAGRAPHS,
        QuestionType.READING_BLANKS,
        QuestionType.READING_WRITING_BLANKS,
    ].includes(typeStr as QuestionType)) {
        return 'Reading';
    }

    // Listening types
    if ([
        QuestionType.SUMMARIZE_SPOKEN_TEXT,
        QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE,
        QuestionType.LISTENING_BLANKS,
        QuestionType.HIGHLIGHT_CORRECT_SUMMARY,
        QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE,
        QuestionType.SELECT_MISSING_WORD,
        QuestionType.HIGHLIGHT_INCORRECT_WORDS,
        QuestionType.WRITE_FROM_DICTATION,
    ].includes(typeStr as QuestionType)) {
        return 'Listening';
    }

    return 'Speaking'; // Default
}

/**
 * @deprecated Use getSectionFromQuestionType instead
 */
export function getSkillFromType(type: string): string {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('speaking') || typeLower.includes('read aloud') || typeLower.includes('repeat sentence') || typeLower.includes('describe image') || typeLower.includes('retell lecture') || typeLower.includes('answer short question')) {
        return 'Speaking';
    }
    if (typeLower.includes('writing') || typeLower.includes('summarize written') || typeLower.includes('essay')) {
        return 'Writing';
    }
    if (typeLower.includes('reading') || typeLower.includes('fill in the blanks') || typeLower.includes('reorder paragraphs') || typeLower.includes('multiple choice')) {
        return 'Reading';
    }
    if (typeLower.includes('listening') || typeLower.includes('summarize spoken') || typeLower.includes('dictation')) {
        return 'Listening';
    }
    return 'Speaking'; // Default/Fallback
}

/**
 * Listening question type info for UI display
 */
export interface ListeningTypeInfo {
    name: string;
    description: string;
    icon: string;
    timeLimit: number; // seconds
    isAIScored: boolean;
}

export const LISTENING_TYPE_INFO: Record<string, ListeningTypeInfo> = {
    'summarize_spoken_text': {
        name: 'Summarize Spoken Text',
        description: 'Listen and write a summary in 50-70 words',
        icon: 'FileText',
        timeLimit: 600,
        isAIScored: true,
    },
    'multiple_choice_multiple': {
        name: 'Multiple Choice (Multiple)',
        description: 'Select all correct answers',
        icon: 'CheckSquare',
        timeLimit: 90,
        isAIScored: false,
    },
    'fill_blanks': {
        name: 'Fill in the Blanks',
        description: 'Type the missing words in the transcript',
        icon: 'Edit3',
        timeLimit: 60,
        isAIScored: false,
    },
    'highlight_correct_summary': {
        name: 'Highlight Correct Summary',
        description: 'Select the paragraph that best summarizes the recording',
        icon: 'Highlighter',
        timeLimit: 90,
        isAIScored: false,
    },
    'multiple_choice_single': {
        name: 'Multiple Choice (Single)',
        description: 'Select the correct answer',
        icon: 'CircleDot',
        timeLimit: 60,
        isAIScored: false,
    },
    'select_missing_word': {
        name: 'Select Missing Word',
        description: 'Select the word that completes the recording',
        icon: 'MousePointer',
        timeLimit: 70,
        isAIScored: false,
    },
    'highlight_incorrect_words': {
        name: 'Highlight Incorrect Words',
        description: 'Click on words that differ from the audio',
        icon: 'AlertCircle',
        timeLimit: 50,
        isAIScored: false,
    },
    'write_from_dictation': {
        name: 'Write from Dictation',
        description: 'Type the sentence exactly as you hear it',
        icon: 'Keyboard',
        timeLimit: 15,
        isAIScored: true,
    },
};
