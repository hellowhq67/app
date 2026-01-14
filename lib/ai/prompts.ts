import { AIFeedbackData, QuestionType } from '@/lib/types'
import { z } from 'zod'
import { AIFeedbackDataSchema, SpeakingFeedbackDataSchema } from './schemas'

const PTE_SCORING_CRITERIA_WRITING = {
  CONTENT: `Content: 0-3 points. Does the essay address all parts of the prompt? Is the opinion clear and well-supported?
    - 3: Fully addresses the prompt. Opinion is clear.
    - 2: Addresses main points but misses minor aspects.
    - 1: Partially addresses prompt or has inaccuracies.
    - 0: Off-topic or non-English.`,
  FORM: `Form (Word Count): 0-2 points.
    - 2: 200-300 words.
    - 1: 120-199 or 301-380 words.
    - 0: <120 or >380 words.`,
  GRAMMAR: `Grammar: 0-2 points.
    - 2: Correct with very few errors.
    - 1: Some errors but meaning is clear.
    - 0: Frequent errors obscuring meaning.`,
  VOCABULARY: `Vocabulary: 0-2 points.
    - 2: Precise and varied.
    - 1: Adequate but limited.
    - 0: Limited with frequent errors.`,
  SPELLING: `Spelling: 0-2 points.
    - 2: 0 spelling errors.
    - 1: 1 spelling error.
    - 0: >1 spelling error.`,
  STRUCTURE: `Structure: 0-2 points.
    - 2: Logical organization.
    - 1: Adequate organization.
    - 0: Poor organization.`,
}

const PTE_SCORING_CRITERIA_SPEAKING = {
  CONTENT: `Content: 0-5 points.
    - 5: All content present/accurate.
    - 3: Most content present.
    - 1: Significant omissions/errors.
    - 0: Non-attempt.`,
  PRONUNCIATION: `Pronunciation: 0-5 points.
    - 5: Native-like.
    - 4: Advanced.
    - 3: Good.
    - 2: Intermediate.
    - 1: Intrusive.
    - 0: Non-English.`,
  FLUENCY: `Fluency: 0-5 points.
    - 5: Native-like.
    - 4: Advanced.
    - 3: Good.
    - 2: Intermediate.
    - 1: Disfluent.
    - 0: Non-English.`,
}

const PTE_SCORING_CRITERIA_READING = {
  ACCURACY: `Accuracy: 0-1 point.
    - 1: Correct.
    - 0: Incorrect.`,
  REORDER_PARAGRAPHS: `Re-order Paragraphs: 1 point per correct adjacent pair.`,
  MULTIPLE_CHOICE_MULTIPLE: `Multiple Choice (Multiple): +1 per correct, -1 per incorrect. Min 0.`,
}

const PTE_SCORING_CRITERIA_LISTENING = {
  ACCURACY: `Accuracy: 0-1 point per correct item/choice/word.`,
  SUMMARIZE_SPOKEN_TEXT: `Summarize Spoken Text: 0-2 points Content, 0-2 Form, 0-2 Grammar, 0-2 Vocabulary, 0-2 Spelling.`,
  WRITE_FROM_DICTATION: `Write from Dictation: 1 point per correct word (spelled correctly).`,
  HIGHLIGHT_INCORRECT_WORDS: `Highlight Incorrect Words: +1 correct, -1 incorrect. Min 0.`,
}

export const getPromptForQuestionType = (
  type: QuestionType,
  params: {
    promptTopic?: string
    originalText?: string
    userInput?: string
    wordCount?: number
    userTranscript?: string
    questionText?: string
    options?: string[]
    paragraphs?: string[]
    wordBank?: string[]
    answerKey?: any
    userResponse?: any
    audioTranscript?: string
  }
): string => {
  const {
    promptTopic,
    originalText,
    userInput,
    wordCount,
    userTranscript,
    questionText,
    options,
    paragraphs,
    wordBank,
    answerKey,
    userResponse,
    audioTranscript,
  } = params

  switch (type) {
    case QuestionType.WRITE_ESSAY:
      if (!promptTopic || !userInput || wordCount === undefined) {
        throw new Error('Missing parameters for WRITE_ESSAY prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Score this essay.

        **Topic**: "${promptTopic}"
        **Essay**: "${userInput}"
        **Word Count**: ${wordCount}

        **Instructions**:
        1. Score each criterion (Content, Form, Grammar, Vocabulary, Spelling, Structure).
        2. Provide specific feedback.
        3. overallScore MUST be the sum of all criterion scores (Max 13-15). Do NOT scale to 90.

        **Criteria**:
        - ${PTE_SCORING_CRITERIA_WRITING.CONTENT}
        - ${PTE_SCORING_CRITERIA_WRITING.FORM}
        - ${PTE_SCORING_CRITERIA_WRITING.GRAMMAR}
        - ${PTE_SCORING_CRITERIA_WRITING.VOCABULARY}
        - ${PTE_SCORING_CRITERIA_WRITING.SPELLING}
        - ${PTE_SCORING_CRITERIA_WRITING.STRUCTURE}
      `
    case QuestionType.SUMMARIZE_WRITTEN_TEXT:
      if (!userInput || wordCount === undefined) {
        throw new Error('Missing parameters for SUMMARIZE_WRITTEN_TEXT prompt.')
      }
      return `
        You are a strict PTE examiner. Score "Summarize Written Text".

        **Summary**: "${userInput}"
        **Word Count**: ${wordCount}

        **Instructions**:
        1. Score Content (0-2), Form (0-1), Grammar (0-2), Vocabulary (0-2).
        2. overallScore MUST be the sum of these scores. Do NOT scale to 90.

        **Criteria**:
        - Content: 2=Good, 1=Missing points, 0=Poor.
        - Form: 1=One sentence 5-75 words, 0=Otherwise.
        - ${PTE_SCORING_CRITERIA_WRITING.GRAMMAR}
        - ${PTE_SCORING_CRITERIA_WRITING.VOCABULARY}
      `
    case QuestionType.REPEAT_SENTENCE:
      if (!audioTranscript || !userTranscript) {
        throw new Error('Missing parameters for REPEAT_SENTENCE prompt.')
      }
      return `
        You are a strict PTE examiner. Score "Repeat Sentence".
        
        **Original**: "${audioTranscript}"
        **Transcript**: "${userTranscript}"

        **Instructions**:
        1. Score Content (0-3), Pronunciation (0-5), Fluency (0-5).
        2. overallScore MUST be the sum of these scores (Max 13). Do NOT scale to 90.

        **Criteria**:
        - Content: 3=All words, 2=50%+, 1=Some, 0=None.
        - ${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}
        - ${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}
      `
    case QuestionType.RE_TELL_LECTURE:
      if (!promptTopic || !userTranscript) {
        throw new Error('Missing parameters for RE_TELL_LECTURE prompt.')
      }
      return `
        You are a strict PTE examiner. Score "Re-tell Lecture".

        **Topic**: "${promptTopic}"
        **Transcript**: "${userTranscript}"

        **Instructions**:
        1. Score Content (0-5), Pronunciation (0-5), Fluency (0-5).
        2. overallScore MUST be the sum of these scores (Max 15).

        **Criteria**:
        - Content: 5=Key points covered, 0=Irrelevant.
        - ${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}
        - ${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}
      `
    case QuestionType.ANSWER_SHORT_QUESTION:
      if (!answerKey || !userTranscript) {
        throw new Error('Missing parameters for ANSWER_SHORT_QUESTION prompt.')
      }
      return `
        Score "Answer Short Question".
        **Correct**: "${answerKey}"
        **Response**: "${userTranscript}"

        **Instructions**:
        1. Check if match (synonyms ok).
        2. Score Vocabulary: 1=Correct, 0=Incorrect.
        3. overallScore MUST be the Vocabulary score.
      `
    case QuestionType.READ_ALOUD:
      if (!originalText || !userTranscript) {
        throw new Error('Missing parameters for READ_ALOUD prompt.')
      }
      return `
        You are a strict PTE examiner. Score "Read Aloud".

        **Text**: "${originalText}"
        **Transcript**: "${userTranscript}"

        **Instructions**:
        1. Score Content (0-5), Pronunciation (0-5), Fluency (0-5).
        2. overallScore MUST be the sum of these scores (Max 15). Do NOT scale to 90.

        **Criteria**:
        - ${PTE_SCORING_CRITERIA_SPEAKING.CONTENT}
        - ${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}
        - ${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}
      `
    case QuestionType.DESCRIBE_IMAGE:
      if (!promptTopic || !userTranscript) {
        throw new Error('Missing parameters for DESCRIBE_IMAGE prompt.')
      }
      return `
        You are a strict PTE examiner. Score "Describe Image".

        **Image**: "${promptTopic}"
        **Transcript**: "${userTranscript}"

        **Instructions**:
        1. Score Content (0-5), Pronunciation (0-5), Fluency (0-5).
        2. overallScore MUST be the sum of these scores (Max 15). Do NOT scale to 90.

        **Criteria**:
        - ${PTE_SCORING_CRITERIA_SPEAKING.CONTENT}
        - ${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}
        - ${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}
      `
    case QuestionType.SUMMARIZE_SPOKEN_TEXT:
      if (!audioTranscript || !userResponse || wordCount === undefined) {
        throw new Error('Missing parameters for SUMMARIZE_SPOKEN_TEXT prompt.')
      }
      return `
        You are a strict PTE examiner. Score "Summarize Spoken Text".

        **Transcript**: "${audioTranscript}"
        **Summary**: "${userResponse}"
        **Words**: ${wordCount}

        **Instructions**:
        1. Score Content (0-2), Form (0-2), Grammar (0-2), Vocabulary (0-2), Spelling (0-2).
        2. overallScore MUST be the sum of these scores (Max 10). Do NOT scale to 90.

        **Criteria**:
        - Content: 2=Good, 1=Fair, 0=Poor.
        - Form: 2=50-70 words, 1=40-49/71-100, 0=<40/>100.
        - ${PTE_SCORING_CRITERIA_WRITING.GRAMMAR}
        - ${PTE_SCORING_CRITERIA_WRITING.VOCABULARY}
        - ${PTE_SCORING_CRITERIA_WRITING.SPELLING}
      `
    case QuestionType.MULTIPLE_CHOICE_SINGLE:
    case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
    case QuestionType.HIGHLIGHT_CORRECT_SUMMARY:
    case QuestionType.SELECT_MISSING_WORD:
      if (!answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for MC/Single prompt')
      }
      return `
        Score this Single Answer question.
        Correct: ${answerKey}
        User: ${userResponse}
        
        Score 1 for match, 0 for mismatch.
        overallScore is the score (0 or 1).
       `
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
    case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
    case QuestionType.HIGHLIGHT_INCORRECT_WORDS:
      if (!options || !answerKey || !userResponse) {
        throw new Error('Missing parameters for MC/Multiple prompt')
      }
      return `
         Score this Multiple Option question.
         Correct Options: ${JSON.stringify(answerKey)}
         User Options: ${JSON.stringify(userResponse)}

         Score +1 for each correct choice, -1 for each incorrect choice. Min 0.
         overallScore is the calculated score.
        `
    case QuestionType.REORDER_PARAGRAPHS:
    case QuestionType.READING_BLANKS:
    case QuestionType.READING_WRITING_BLANKS:
    case QuestionType.LISTENING_BLANKS:
    case QuestionType.WRITE_FROM_DICTATION:
      return `
          Score this item.
          Correct: ${JSON.stringify(answerKey)}
          User: ${JSON.stringify(userResponse)}

          Score 1 point for each correct match/pair/blank/word.
          overallScore is the total points.
         `
    // CORE Speaking Types
    case QuestionType.RESPOND_TO_A_SITUATION:
      if (!promptTopic || !userTranscript) {
        throw new Error('Missing parameters for RESPOND_TO_A_SITUATION prompt.')
      }
      return `
        You are a strict PTE Core examiner. Score "Respond to a Situation".

        **Situation**: "${promptTopic}"
        **Transcript**: "${userTranscript}"

        **Instructions**:
        1. Score Appropriateness (0-3), Content (0-5), Pronunciation (0-5), Fluency (0-5).
        2. overallScore MUST be the sum of these scores (Max 18). Do NOT scale to 90.

        **Criteria**:
        - Appropriateness: 3=Fully appropriate register/tone for the situation, 2=Mostly appropriate, 1=Somewhat appropriate, 0=Inappropriate.
        - Content: 5=All relevant points addressed, 3=Most points covered, 1=Few points, 0=Off-topic.
        - ${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}
        - ${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}

        **Key Considerations**:
        - Is the response appropriate for the context (formal/informal)?
        - Does it address the specific situation?
        - Is the tone suitable for the audience?
      `
    case QuestionType.SUMMARIZE_GROUP_DISCUSSION:
      if (!audioTranscript || !userTranscript) {
        throw new Error('Missing parameters for SUMMARIZE_GROUP_DISCUSSION prompt.')
      }
      return `
        You are a strict PTE Core examiner. Score "Summarize Group Discussion".

        **Discussion Transcript**: "${audioTranscript}"
        **User Summary**: "${userTranscript}"

        **Instructions**:
        1. Score Content (0-5), Pronunciation (0-5), Fluency (0-5).
        2. overallScore MUST be the sum of these scores (Max 15). Do NOT scale to 90.

        **Criteria**:
        - Content: 5=All main points and perspectives summarized, 3=Most points covered, 1=Significant omissions, 0=Inaccurate/irrelevant.
        - ${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}
        - ${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}

        **Key Considerations**:
        - Are the main viewpoints from the discussion captured?
        - Is there a balance between different speakers' perspectives?
        - Is the summary coherent and organized?
      `

    default:
      throw new Error(`Scoring prompt for question type "${type}" is not implemented.`)
  }
}

export const SCORING_ZOD_SCHEMA: Record<QuestionType, any> = {
  [QuestionType.WRITE_ESSAY]: AIFeedbackDataSchema,
  [QuestionType.READ_ALOUD]: SpeakingFeedbackDataSchema,
  [QuestionType.MULTIPLE_CHOICE_SINGLE]: AIFeedbackDataSchema,
  [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: AIFeedbackDataSchema,
  [QuestionType.REORDER_PARAGRAPHS]: AIFeedbackDataSchema,
  [QuestionType.READING_BLANKS]: AIFeedbackDataSchema,
  [QuestionType.READING_WRITING_BLANKS]: AIFeedbackDataSchema,
  [QuestionType.SUMMARIZE_SPOKEN_TEXT]: AIFeedbackDataSchema,
  [QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE]: AIFeedbackDataSchema,
  [QuestionType.LISTENING_BLANKS]: AIFeedbackDataSchema,
  [QuestionType.HIGHLIGHT_CORRECT_SUMMARY]: AIFeedbackDataSchema,
  [QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE]: AIFeedbackDataSchema,
  [QuestionType.SELECT_MISSING_WORD]: AIFeedbackDataSchema,
  [QuestionType.HIGHLIGHT_INCORRECT_WORDS]: AIFeedbackDataSchema,
  [QuestionType.WRITE_FROM_DICTATION]: AIFeedbackDataSchema,
  [QuestionType.REPEAT_SENTENCE]: SpeakingFeedbackDataSchema,
  [QuestionType.DESCRIBE_IMAGE]: SpeakingFeedbackDataSchema,
  [QuestionType.RE_TELL_LECTURE]: SpeakingFeedbackDataSchema,
  [QuestionType.ANSWER_SHORT_QUESTION]: SpeakingFeedbackDataSchema,
  [QuestionType.RESPOND_TO_A_SITUATION]: SpeakingFeedbackDataSchema,
  [QuestionType.SUMMARIZE_GROUP_DISCUSSION]: SpeakingFeedbackDataSchema,
  [QuestionType.SUMMARIZE_WRITTEN_TEXT]: AIFeedbackDataSchema,
  [QuestionType.WRITE_EMAIL]: AIFeedbackDataSchema,
  [QuestionType.PERSONAL_INTRODUCTION]: SpeakingFeedbackDataSchema, // Placeholder or unscored schema
}