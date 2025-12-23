import { AIFeedbackData, QuestionType } from '@/lib/types'
import { z } from 'zod'

const PTE_SCORING_CRITERIA_WRITING = {
  CONTENT: `Content: 0-3 points. Does the essay address all parts of the topic? Is the opinion clear and well-supported with relevant examples and details?
    - 3: Fully addresses the prompt. Opinion is clear, and all arguments are well-supported.
    - 2: Addresses the main points but may neglect minor aspects. Arguments are mostly supported.
    - 1: Partially addresses the prompt, contains inaccuracies, or arguments are poorly supported.
    - 0: Does not address the prompt, is off-topic, or is not in English.`,
  FORM: `Form (Word Count): 0-2 points. Word count is between 200 and 300 words.
    - 2: 200-300 words.
    - 1: 120-199 or 301-380 words.
    - 0: Fewer than 120 or more than 380 words, or not a valid essay.`,
  GRAMMAR: `Grammar: 0-2 points. Demonstrates consistent control over simple and complex grammar.
    - 2: Sentences are grammatically correct with very few minor errors.
    - 1: Shows some control of grammar but makes several errors.
    - 0: Lacks grammatical control, contains frequent errors that obscure meaning.`,
  VOCABULARY: `Vocabulary: 0-2 points. Use of a wide range of academic vocabulary with precision.
    - 2: Rich and precise vocabulary. Good command of collocations.
    - 1: Adequate but not wide-ranging vocabulary. Some errors in word choice.
    - 0: Limited vocabulary, frequent errors.`,
  SPELLING: `Spelling: 0-2 points. Correct spelling according to US or UK conventions.
    - 2: All words spelled correctly.
    - 1: One spelling error.
    - 0: More than one spelling error.`,
  STRUCTURE: `Structure: 0-2 points. Is the essay well-organized with a clear introduction, body paragraphs, and conclusion?
    - 2: Excellent organization with logical paragraphing and clear topic sentences.
    - 1: Adequately organized but may lack a clear progression of ideas.
    - 0: Poorly organized, lacks paragraphing, or is illogical.`,
}

const PTE_SCORING_CRITERIA_SPEAKING = {
  CONTENT: `Content: 0-5 points. Does the response convey all relevant aspects of the prompt? For "Read Aloud", does the response match the text exactly?
    - 5: All words from the prompt are present and correctly spoken.
    - 3: Most words are present and correctly spoken, but a few omissions or substitutions.
    - 1: Many words are omitted or substituted, significantly altering the meaning.`,
  PRONUNCIATION: `Pronunciation: 0-5 points. Assesses the clarity and accuracy of individual sounds and word stress.
    - 5: Native-like pronunciation, all sounds clear and correct.
    - 3: Generally clear pronunciation, but some minor inaccuracies.
    - 1: Noticeable errors in pronunciation, difficult to understand.`,
  FLUENCY: `Fluency: 0-5 points. Assesses the rhythm, phrasing, and naturalness of speech.
    - 5: Smooth, effortless, and natural rhythm of speech with appropriate phrasing.
    - 3: Generally fluent with some hesitation or repetition, but manageable.
    - 1: Frequent hesitation, repetition, or unnatural phrasing, making it difficult to follow.`,
}

const PTE_SCORING_CRITERIA_READING = {
  ACCURACY: `Accuracy: 0-1 point per correct item/choice.
    - 1: Fully correct item/choice.
    - 0: Incorrect item/choice.`,
  REORDER_PARAGRAPHS: `Re-order Paragraphs: 0-1 point for each correct adjacent pair.
    - 1: Adjacent paragraphs are in correct order.
    - 0: Adjacent paragraphs are in incorrect order.`,
  MULTIPLE_CHOICE_MULTIPLE: `Multiple Choice, Multiple Answers: +1 for each correct selection, -1 for each incorrect selection. Minimum score of 0 for the question.
    - Example: If 3 correct options and 1 incorrect option are chosen, score = 3 - 1 = 2.
    - Example: If 1 correct option and 3 incorrect options are chosen, score = 1 - 3 = -2, clamped to 0.`,
}

const PTE_SCORING_CRITERIA_LISTENING = {
  ACCURACY: `Accuracy: 0-1 point per correct item/choice/word.
    - 1: Fully correct item/choice/word.
    - 0: Incorrect item/choice/word.`,
  SUMMARIZE_SPOKEN_TEXT: `Summarize Spoken Text: 0-3 points for content, 0-2 for form (50-70 words), 0-2 for grammar, 0-2 for vocabulary.
    - Content: Does the summary capture all key points?
    - Form: Is the word count within 50-70 words?
    - Grammar: Is the grammar correct?
    - Vocabulary: Is the vocabulary appropriate and varied?`,
  WRITE_FROM_DICTATION: `Write from Dictation: 0-1 point per correct word.`,
  HIGHLIGHT_INCORRECT_WORDS: `Highlight Incorrect Words: +1 for each correctly highlighted incorrect word, -1 for each incorrectly highlighted correct word. Minimum score of 0.`,
}

export const getPromptForQuestionType = (
  type: QuestionType,
  params: {
    promptTopic?: string
    originalText?: string
    userInput?: string
    wordCount?: number
    userTranscript?: string
    questionText?: string // For reading (common), listening (text-based)
    options?: string[] // For multiple choice
    paragraphs?: string[] // For reorder paragraphs
    wordBank?: string[] // For listening fill in blanks (word bank)
    answerKey?: any // Correct answers (string, string[], number[], Record<string, string>)
    userResponse?: any // User's response (string, string[], number[], Record<string, string>)
    audioTranscript?: string // For listening, the original transcript of the audio
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
        You are a strict, expert PTE Academic examiner. Your task is to score an essay written by a test-taker.

        **Essay Topic**: "${promptTopic}"
        **Test-taker's Essay**: "${userInput}"
        **Word Count**: ${wordCount}

        **Instructions**:
        1.  Analyze the essay meticulously based on the official PTE scoring criteria below.
        2.  Provide a score (an integer from the allowed points) for each of the six criteria: Content, Form, Grammar, Vocabulary, Spelling, and Structure.
        3.  Provide specific, constructive feedback for each criterion, explaining WHY you gave that score. Quote parts of the essay to support your feedback.
        4.  Generate a list of specific strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **${PTE_SCORING_CRITERIA_WRITING.CONTENT}**
        - **${PTE_SCORING_CRITERIA_WRITING.FORM}**
        - **${PTE_SCORING_CRITERIA_WRITING.GRAMMAR}**
        - **${PTE_SCORING_CRITERIA_WRITING.VOCABULARY}**
        - **${PTE_SCORING_CRITERIA_WRITING.SPELLING}**
        - **${PTE_SCORING_CRITERIA_WRITING.STRUCTURE}**

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated by converting the total points (out of 13) to the PTE 90-point scale.
        Example for calculating overallScore: (Total Points / 13) * 90.
      `
    case QuestionType.READ_ALOUD:
      if (!originalText || !userTranscript) {
        throw new Error('Missing parameters for READ_ALOUD prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Read Aloud" response.

        **Original Text**: "${originalText}"
        **Test-taker's Transcript (from their audio)**: "${userTranscript}"

        **Instructions**:
        1.  Analyze the user's transcript against the original text and provide scores (integer from 0-5) for Content, Pronunciation, and Fluency.
        2.  Provide specific, constructive feedback for each criterion, explaining WHY you gave that score. Highlight discrepancies in the transcript for Content.
        3.  Generate a list of specific strengths and areas for improvement.
        4.  The final JSON output must conform to the SpeakingFeedbackData Zod schema.

        **Scoring Criteria Details (0-5 points for each)**:
        - **${PTE_SCORING_CRITERIA_SPEAKING.CONTENT}**
        - **${PTE_SCORING_CRITERIA_SPEAKING.PRONUNCIATION}**
        - **${PTE_SCORING_CRITERIA_SPEAKING.FLUENCY}**

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated by converting the total points (out of 15) to the PTE 90-point scale.
        Example for calculating overallScore: (Total Points / 15) * 90.
        Assume the provided userTranscript accurately represents the user's pronunciation and fluency for scoring purposes.
      `
    case QuestionType.MULTIPLE_CHOICE_SINGLE:
    case QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE:
      if (!questionText || !options || !answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for MULTIPLE_CHOICE_SINGLE prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Multiple Choice, Single Answer" response.

        **Question**: "${questionText}"
        **Options**: ${JSON.stringify(options)}
        **Correct Answer**: "${answerKey}"
        **User's Answer**: "${userResponse}"

        **Instructions**:
        1.  Compare the user's answer with the correct answer.
        2.  Provide a score for Accuracy (0 or 1 point).
        3.  Provide specific feedback explaining if the answer was correct or incorrect.
        4.  Generate a list of strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_READING.ACCURACY}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / 1) * 90.
      `
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
    case QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE:
      if (!questionText || !options || !answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for MULTIPLE_CHOICE_MULTIPLE prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Multiple Choice, Multiple Answers" response.

        **Question**: "${questionText}"
        **Options**: ${JSON.stringify(options)}
        **Correct Answers**: ${JSON.stringify(answerKey)}
        **User's Answers**: ${JSON.stringify(userResponse)}

        **Instructions**:
        1.  Compare the user's answers with the correct answers based on PTE scoring: +1 for each correct selection, -1 for each incorrect selection, with a minimum score of 0.
        2.  Provide the final score for Accuracy.
        3.  Provide specific feedback explaining which options were correct/incorrectly chosen.
        4.  Generate a list of strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_READING.MULTIPLE_CHOICE_MULTIPLE}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / Total Correct Options) * 90.
      `
    case QuestionType.REORDER_PARAGRAPHS:
      if (!paragraphs || !answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for REORDER_PARAGRAPHS prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Re-order Paragraphs" response.

        **Original Paragraphs (indexed)**: ${JSON.stringify(paragraphs.map((p, i) => ({ index: i + 1, text: p })))}
        **Correct Order (indices)**: ${JSON.stringify(answerKey)}
        **User's Order (indices)**: ${JSON.stringify(userResponse)}

        **Instructions**:
        1.  Compare the user's ordered paragraphs with the correct order based on PTE scoring: 1 point for each correct adjacent pair.
        2.  Provide the final score for Accuracy.
        3.  Provide specific feedback on which pairs were correct and suggest improvements for incorrect pairs.
        4.  Generate a list of strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_READING.REORDER_PARAGRAPHS}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / Total Correct Pairs) * 90.
      `
    case QuestionType.READING_BLANKS:
    case QuestionType.READING_WRITING_BLANKS:
    case QuestionType.LISTENING_BLANKS:
    case QuestionType.SELECT_MISSING_WORD:
      if (!questionText || !answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for FILL_IN_BLANKS / SELECT_MISSING_WORD prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Fill in the Blanks" or "Select Missing Word" response.

        **Question Text (with blanks indicated)**: "${questionText}"
        **Correct Answers (Map of blank index to correct word or single correct word for select missing)**: ${JSON.stringify(answerKey)}
        **User's Answers (Map of blank index to user's word or single user word)**: ${JSON.stringify(userResponse)}

        **Instructions**:
        1.  Compare each of the user's answers for the blanks with the correct answers. Each correct blank gets 1 point.
        2.  Provide the final score for Accuracy.
        3.  Provide specific feedback on which blanks were filled correctly/incorrectly.
        4.  Generate a list of strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_LISTENING.ACCURACY} (1 point per correct item)

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / Total Correct Items) * 90.
      `
    case QuestionType.SUMMARIZE_SPOKEN_TEXT:
      if (!audioTranscript || !userResponse || wordCount === undefined) {
        throw new Error('Missing parameters for SUMMARIZE_SPOKEN_TEXT prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Summarize Spoken Text" response.

        **Original Audio Transcript**: "${audioTranscript}"
        **User's Summary**: "${userResponse}"
        **Word Count of User's Summary**: ${wordCount}

        **Instructions**:
        1.  Evaluate the user's summary based on the PTE scoring criteria below.
        2.  Provide scores for Content (0-3), Form (word count 50-70 words, 0-2), Grammar (0-2), and Vocabulary (0-2).
        3.  Provide specific feedback for each criterion.
        4.  Generate a list of strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **${PTE_SCORING_CRITERIA_LISTENING.SUMMARIZE_SPOKEN_TEXT}**
        - **Grammar**: ${PTE_SCORING_CRITERIA_WRITING.GRAMMAR}
        - **Vocabulary**: ${PTE_SCORING_CRITERIA_WRITING.VOCABULARY}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Total Points / 9) * 90.
      `
    case QuestionType.HIGHLIGHT_CORRECT_SUMMARY:
      if (!questionText || !options || !answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for HIGHLIGHT_CORRECT_SUMMARY prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Highlight Correct Summary" response.

        **Question (Context)**: "${questionText}"
        **Summary Options**: ${JSON.stringify(options)}
        **Correct Summary Index**: ${answerKey}
        **User's Selected Summary Index**: ${userResponse}

        **Instructions**:
        1.  Compare the user's selected summary with the correct summary.
        2.  Provide a score for Accuracy (0 or 1 point).
        3.  Provide specific feedback explaining if the selection was correct or incorrect.
        4.  Generate a list of strengths and areas for improvement.
        5.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_LISTENING.ACCURACY}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / 1) * 90.
      `
    case QuestionType.HIGHLIGHT_INCORRECT_WORDS:
      if (!questionText || !answerKey || userResponse === undefined) {
        throw new Error('Missing parameters for HIGHLIGHT_INCORRECT_WORDS prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Highlight Incorrect Words" response.

        **Passage Text (with incorrect words as per audio)**: "${questionText}"
        **Correctly Identified Incorrect Words (indices)**: ${JSON.stringify(answerKey)}
        **User's Highlighted Words (indices)**: ${JSON.stringify(userResponse)}

        **Instructions**:
        1.  Score the user's highlighted words against the correctly identified incorrect words.
        2.  Award +1 for each correctly highlighted incorrect word.
        3.  Deduct -1 for each incorrectly highlighted correct word.
        4.  The minimum score for the question is 0.
        5.  Provide feedback on specific highlights and overall accuracy.
        6.  Generate a list of strengths and areas for improvement.
        7.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_LISTENING.HIGHLIGHT_INCORRECT_WORDS}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / Total Incorrect Words) * 90.
      `
    case QuestionType.WRITE_FROM_DICTATION:
      if (!audioTranscript || !userResponse) {
        throw new Error('Missing parameters for WRITE_FROM_DICTATION prompt.')
      }
      return `
        You are a strict, expert PTE Academic examiner. Your task is to score a "Write from Dictation" response.

        **Original Dictated Text (from audio)**: "${audioTranscript}"
        **User's Written Response**: "${userResponse}"

        **Instructions**:
        1.  Compare the user's written response word-for-word with the original dictated text.
        2.  Award 1 point for each correctly spelled and ordered word.
        3.  Provide the final score for Accuracy.
        4.  Provide specific feedback on incorrect words or missing words.
        5.  Generate a list of strengths and areas for improvement.
        6.  The final JSON output must conform to the AIFeedbackData Zod schema.

        **Scoring Criteria Details**:
        - **Accuracy**: ${PTE_SCORING_CRITERIA_LISTENING.WRITE_FROM_DICTATION}

        Your response MUST be a valid JSON object. Do not include any text outside of the JSON structure.
        The overallScore should be calculated as (Accuracy Score / Total Words in Dictation) * 90.
      `
    default:
      throw new Error(`Scoring prompt for question type "${type}" is not implemented.`)
  }
}

export const SCORING_ZOD_SCHEMA: Record<QuestionType, any> = {
  [QuestionType.WRITE_ESSAY]: AIFeedbackData,
  [QuestionType.READ_ALOUD]: AIFeedbackData,
  [QuestionType.MULTIPLE_CHOICE_SINGLE]: AIFeedbackData,
  [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: AIFeedbackData,
  [QuestionType.REORDER_PARAGRAPHS]: AIFeedbackData,
  [QuestionType.READING_BLANKS]: AIFeedbackData,
  [QuestionType.READING_WRITING_BLANKS]: AIFeedbackData,
  [QuestionType.SUMMARIZE_SPOKEN_TEXT]: AIFeedbackData,
  [QuestionType.LISTENING_MULTIPLE_CHOICE_MULTIPLE]: AIFeedbackData,
  [QuestionType.LISTENING_BLANKS]: AIFeedbackData,
  [QuestionType.HIGHLIGHT_CORRECT_SUMMARY]: AIFeedbackData,
  [QuestionType.LISTENING_MULTIPLE_CHOICE_SINGLE]: AIFeedbackData,
  [QuestionType.SELECT_MISSING_WORD]: AIFeedbackData,
  [QuestionType.HIGHLIGHT_INCORRECT_WORDS]: AIFeedbackData,
  [QuestionType.WRITE_FROM_DICTATION]: AIFeedbackData,
  // Add other schemas here...
}
`