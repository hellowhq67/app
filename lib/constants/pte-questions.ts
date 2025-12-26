// PTE Question Types Configuration
export const PTE_QUESTION_TYPES = {
    // Speaking (6 types)
    SPEAKING: {
        READ_ALOUD: {
            code: 'read_aloud',
            name: 'Read Aloud',
            description: 'Read a short text aloud',
            category: 'speaking',
            prepTime: 35,
            answerTime: 40,
            icon: 'Mic'
        },
        REPEAT_SENTENCE: {
            code: 'repeat_sentence',
            name: 'Repeat Sentence',
            description: 'Repeat a sentence you hear',
            category: 'speaking',
            prepTime: 0,
            answerTime: 15,
            icon: 'Repeat'
        },
        DESCRIBE_IMAGE: {
            code: 'describe_image',
            name: 'Describe Image',
            description: 'Describe an image in detail',
            category: 'speaking',
            prepTime: 25,
            answerTime: 40,
            icon: 'Image'
        },
        RETELL_LECTURE: {
            code: 'retell_lecture',
            name: 'Retell Lecture',
            description: 'Summarize a lecture you hear',
            category: 'speaking',
            prepTime: 0,
            answerTime: 40,
            icon: 'Headphones'
        },
        ANSWER_SHORT_QUESTION: {
            code: 'answer_short_question',
            name: 'Answer Short Question',
            description: 'Answer a short question',
            category: 'speaking',
            prepTime: 3,
            answerTime: 10,
            icon: 'MessageCircle'
        },
        SUMMARIZE_GROUP_DISCUSSION: {
            code: 'summarize_group_discussion',
            name: 'Summarize Group Discussion',
            description: 'Summarize a group discussion',
            category: 'speaking',
            prepTime: 0,
            answerTime: 60,
            icon: 'Users'
        }
    },

    // Writing (2 types)
    WRITING: {
        SUMMARIZE_WRITTEN_TEXT: {
            code: 'summarize_written_text',
            name: 'Summarize Written Text',
            description: 'Write a summary of a text',
            category: 'writing',
            prepTime: 10,
            answerTime: 10,
            icon: 'FileText',
            wordCount: { min: 5, max: 75 }
        },
        ESSAY: {
            code: 'essay',
            name: 'Essay',
            description: 'Write an essay on a topic',
            category: 'writing',
            prepTime: 2,
            answerTime: 20,
            icon: 'FileText',
            wordCount: { min: 200, max: 300 }
        }
    },

    // Reading (5 types)
    READING: {
        MULTIPLE_CHOICE_SINGLE: {
            code: 'multiple_choice_single',
            name: 'Multiple Choice Single Answer',
            description: 'Choose one correct answer',
            category: 'reading',
            prepTime: 0,
            answerTime: 2,
            icon: 'List'
        },
        MULTIPLE_CHOICE_MULTIPLE: {
            code: 'multiple_choice_multiple',
            name: 'Multiple Choice Multiple Answers',
            description: 'Choose multiple correct answers',
            category: 'reading',
            prepTime: 0,
            answerTime: 2,
            icon: 'List'
        },
        REORDER_PARAGRAPHS: {
            code: 'reorder_paragraphs',
            name: 'Re-order Paragraphs',
            description: 'Arrange paragraphs in correct order',
            category: 'reading',
            prepTime: 0,
            answerTime: 2,
            icon: 'AlignLeft'
        },
        FILL_IN_THE_BLANKS: {
            code: 'fill_in_the_blanks',
            name: 'Fill in the Blanks',
            description: 'Fill in missing words',
            category: 'reading',
            prepTime: 0,
            answerTime: 2,
            icon: 'Square'
        },
        READING_AND_WRITING_FILL_IN_THE_BLANKS: {
            code: 'reading_and_writing_fill_in_the_blanks',
            name: 'Reading & Writing Fill in the Blanks',
            description: 'Fill in blanks with drag and drop',
            category: 'reading',
            prepTime: 0,
            answerTime: 2,
            icon: 'DragDrop'
        }
    },

    // Listening (6 types)
    LISTENING: {
        SUMMARIZE_SPOKEN_TEXT: {
            code: 'summarize_spoken_text',
            name: 'Summarize Spoken Text',
            description: 'Write summary of audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 10,
            icon: 'Headphones',
            wordCount: { min: 50, max: 70 }
        },
        MULTIPLE_CHOICE_SINGLE_LISTENING: {
            code: 'multiple_choice_single_listening',
            name: 'Multiple Choice Single Answer',
            description: 'Choose one correct answer from audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'Headphones'
        },
        MULTIPLE_CHOICE_MULTIPLE_LISTENING: {
            code: 'multiple_choice_multiple_listening',
            name: 'Multiple Choice Multiple Answers',
            description: 'Choose multiple correct answers from audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'Headphones'
        },
        FILL_IN_THE_BLANKS_LISTENING: {
            code: 'fill_in_the_blanks_listening',
            name: 'Fill in the Blanks',
            description: 'Fill in missing words from audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'Headphones'
        },
        HIGHLIGHT_CORRECT_SUMMARY: {
            code: 'highlight_correct_summary',
            name: 'Highlight Correct Summary',
            description: 'Choose correct summary of audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'Highlighter'
        },
        SELECT_MISSING_WORD: {
            code: 'select_missing_word',
            name: 'Select Missing Word',
            description: 'Choose missing word from audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'QuestionMark'
        },
        HIGHLIGHT_INCORRECT_WORDS: {
            code: 'highlight_incorrect_words',
            name: 'Highlight Incorrect Words',
            description: 'Highlight words that differ from audio',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'Highlighter'
        },
        WRITE_FROM_DICTATION: {
            code: 'write_from_dictation',
            name: 'Write from Dictation',
            description: 'Write what you hear',
            category: 'listening',
            prepTime: 0,
            answerTime: 2,
            icon: 'Keyboard'
        }
    }
}

// Flatten all question types for easier access
export const ALL_QUESTION_TYPES = {
    ...PTE_QUESTION_TYPES.SPEAKING,
    ...PTE_QUESTION_TYPES.WRITING,
    ...PTE_QUESTION_TYPES.READING,
    ...PTE_QUESTION_TYPES.LISTENING
}

// Get question type by code
export const getQuestionTypeByCode = (code: string) => {
    return Object.values(ALL_QUESTION_TYPES).find(type => type.code === code)
}

// Get question types by category
export const getQuestionTypesByCategory = (category: string) => {
    switch (category) {
        case 'speaking':
            return Object.values(PTE_QUESTION_TYPES.SPEAKING)
        case 'writing':
            return Object.values(PTE_QUESTION_TYPES.WRITING)
        case 'reading':
            return Object.values(PTE_QUESTION_TYPES.READING)
        case 'listening':
            return Object.values(PTE_QUESTION_TYPES.LISTENING)
        default:
            return []
    }
}

// Get all categories
export const CATEGORIES = [
    { code: 'speaking', name: 'Speaking', icon: 'Mic' },
    { code: 'writing', name: 'Writing', icon: 'FileText' },
    { code: 'reading', name: 'Reading', icon: 'Book' },
    { code: 'listening', name: 'Listening', icon: 'Headphones' }
]