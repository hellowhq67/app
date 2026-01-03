// PTE Academic Mock Test Constants
// Note: These codes must match the schema enum values in pte-categories.ts

export const PTE_SECTIONS = {
  SPEAKING_WRITING: 'speaking_writing',
  READING: 'reading',
  LISTENING: 'listening'
} as const;

export const PTE_QUESTION_TYPES = {
  // Speaking & Writing Section
  READ_ALOUD: 'read_aloud',
  REPEAT_SENTENCE: 'repeat_sentence',
  DESCRIBE_IMAGE: 'describe_image',
  RETELL_LECTURE: 'retell_lecture',
  ANSWER_SHORT_QUESTION: 'answer_short_question',
  RESPOND_TO_SITUATION: 'respond_to_situation',
  SUMMARIZE_GROUP_DISCUSSION: 'summarize_group_discussion',
  SUMMARIZE_WRITTEN_TEXT: 'summarize_written_text',
  ESSAY: 'essay',
  
  // Reading Section
  FILL_IN_BLANKS_DROPDOWN: 'fill_in_blanks_dropdown',
  MC_MULTIPLE_ANSWERS_READING: 'mc_multiple_answers_reading',
  REORDER_PARAGRAPHS: 'reorder_paragraphs',
  FILL_IN_BLANKS_DRAG_DROP: 'fill_in_blanks_drag_drop',
  MC_SINGLE_ANSWER_READING: 'mc_single_answer_reading',
  
  // Listening Section
  SUMMARIZE_SPOKEN_TEXT: 'summarize_spoken_text',
  MC_MULTIPLE_ANSWERS_LISTENING: 'mc_multiple_answers_listening',
  FILL_IN_BLANKS_LISTENING: 'fill_in_blanks_listening',
  HIGHLIGHT_CORRECT_SUMMARY: 'highlight_correct_summary',
  MC_SINGLE_ANSWER_LISTENING: 'mc_single_answer_listening',
  SELECT_MISSING_WORD: 'select_missing_word',
  HIGHLIGHT_INCORRECT_WORDS: 'highlight_incorrect_words',
  WRITE_FROM_DICTATION: 'write_from_dictation'
} as const;

export const PTE_QUESTION_TIMING = {
  // Speaking & Writing (77-93 minutes total)
  [PTE_QUESTION_TYPES.READ_ALOUD]: {
    preparation: 35,
    response: 40,
    total: 75
  },
  [PTE_QUESTION_TYPES.REPEAT_SENTENCE]: {
    response: 15,
    total: 15
  },
  [PTE_QUESTION_TYPES.DESCRIBE_IMAGE]: {
    preparation: 25,
    response: 40,
    total: 65
  },
  [PTE_QUESTION_TYPES.RETELL_LECTURE]: {
    preparation: 10,
    response: 40,
    total: 50
  },
  [PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION]: {
    response: 10,
    total: 10
  },
  [PTE_QUESTION_TYPES.RESPOND_TO_SITUATION]: {
    preparation: 30,
    response: 60,
    total: 90
  },
  [PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION]: {
    preparation: 20,
    response: 60,
    total: 80
  },
  [PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT]: {
    response: 600, // 10 minutes
    total: 600
  },
  [PTE_QUESTION_TYPES.ESSAY]: {
    response: 1200, // 20 minutes
    total: 1200
  },
  
  // Reading Section (32-41 minutes total)
  [PTE_QUESTION_TYPES.FILL_IN_BLANKS_DROPDOWN]: {
    response: 90, // ~1.5 minutes per question
    total: 90
  },
  [PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING]: {
    response: 120, // ~2 minutes per question
    total: 120
  },
  [PTE_QUESTION_TYPES.REORDER_PARAGRAPHS]: {
    response: 150, // ~2.5 minutes per question
    total: 150
  },
  [PTE_QUESTION_TYPES.FILL_IN_BLANKS_DRAG_DROP]: {
    response: 105, // ~1.75 minutes per question
    total: 105
  },
  [PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_READING]: {
    response: 90, // ~1.5 minutes per question
    total: 90
  },
  
  // Listening Section (45-57 minutes total)
  [PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT]: {
    response: 600, // 10 minutes
    total: 600
  },
  [PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_LISTENING]: {
    response: 90, // ~1.5 minutes per question
    total: 90
  },
  [PTE_QUESTION_TYPES.FILL_IN_BLANKS_LISTENING]: {
    response: 60, // ~1 minute per question
    total: 60
  },
  [PTE_QUESTION_TYPES.HIGHLIGHT_CORRECT_SUMMARY]: {
    response: 105, // ~1.75 minutes per question
    total: 105
  },
  [PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_LISTENING]: {
    response: 75, // ~1.25 minutes per question
    total: 75
  },
  [PTE_QUESTION_TYPES.SELECT_MISSING_WORD]: {
    response: 30, // ~30 seconds per question
    total: 30
  },
  [PTE_QUESTION_TYPES.HIGHLIGHT_INCORRECT_WORDS]: {
    response: 90, // ~1.5 minutes per question
    total: 90
  },
  [PTE_QUESTION_TYPES.WRITE_FROM_DICTATION]: {
    response: 45, // ~45 seconds per question
    total: 45
  }
} as const;

export const PTE_SECTION_TIMING = {
  [PTE_SECTIONS.SPEAKING_WRITING]: {
    duration: 93 * 60, // 93 minutes in seconds
    displayName: 'Speaking & Writing'
  },
  [PTE_SECTIONS.READING]: {
    duration: 41 * 60, // 41 minutes in seconds
    displayName: 'Reading'
  },
  [PTE_SECTIONS.LISTENING]: {
    duration: 57 * 60, // 57 minutes in seconds
    displayName: 'Listening'
  }
} as const;

export const PTE_BREAK_DURATION = 10 * 60; // 10 minutes in seconds

export const PTE_SCORING = {
  MIN_SCORE: 10,
  MAX_SCORE: 90,
  COMMUNICATIVE_SKILLS: {
    SPEAKING: 'speaking',
    WRITING: 'writing',
    READING: 'reading',
    LISTENING: 'listening'
  }
} as const;

export const PTE_AI_SCORED_QUESTIONS = [
  PTE_QUESTION_TYPES.READ_ALOUD,
  PTE_QUESTION_TYPES.REPEAT_SENTENCE,
  PTE_QUESTION_TYPES.DESCRIBE_IMAGE,
  PTE_QUESTION_TYPES.RETELL_LECTURE,
  PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION,
  PTE_QUESTION_TYPES.RESPOND_TO_SITUATION,
  PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION,
  PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT,
  PTE_QUESTION_TYPES.ESSAY,
  PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT
] as const;

export const PTE_AUDIO_RESTRICTIONS = {
  [PTE_QUESTION_TYPES.REPEAT_SENTENCE]: { maxPlays: 1 },
  [PTE_QUESTION_TYPES.DESCRIBE_IMAGE]: { maxPlays: 0 },
  [PTE_QUESTION_TYPES.RETELL_LECTURE]: { maxPlays: 1 },
  [PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION]: { maxPlays: 1 },
  [PTE_QUESTION_TYPES.RESPOND_TO_SITUATION]: { maxPlays: 1 },
  [PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION]: { maxPlays: 1 },
  [PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT]: { maxPlays: 2 },
  [PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_LISTENING]: { maxPlays: 2 },
  [PTE_QUESTION_TYPES.FILL_IN_BLANKS_LISTENING]: { maxPlays: 2 },
  [PTE_QUESTION_TYPES.HIGHLIGHT_CORRECT_SUMMARY]: { maxPlays: 2 },
  [PTE_QUESTION_TYPES.MC_SINGLE_ANSWER_LISTENING]: { maxPlays: 2 },
  [PTE_QUESTION_TYPES.SELECT_MISSING_WORD]: { maxPlays: 1 },
  [PTE_QUESTION_TYPES.HIGHLIGHT_INCORRECT_WORDS]: { maxPlays: 2 },
  [PTE_QUESTION_TYPES.WRITE_FROM_DICTATION]: { maxPlays: 2 }
} as const;

export const PTE_WORD_COUNTS = {
  [PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT]: {
    min: 5,
    max: 75,
    target: 30
  },
  [PTE_QUESTION_TYPES.ESSAY]: {
    min: 200,
    max: 300,
    target: 250
  },
  [PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT]: {
    min: 50,
    max: 70,
    target: 60
  }
} as const;
