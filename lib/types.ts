import { type PteQuestionType as QuestionTypeCode } from './db/schema/pte-categories';

// --- User & Auth ---
export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  subscriptionTier: 'free' | 'basic' | 'premium' | 'unlimited'
  rateLimit: {
    dailyQuestionsUsed: number
    dailyQuestionsLimit: number
  }
}

// --- Practice Session ---
export interface PracticeSession {
  id: string
  userId: string
  questionId: string
  score: number
  date: string
}

export interface SpeakingScore {
  overall: number
  content: number
  pronunciation: number
  fluency: number
  feedback: string
  wordAnalysis: any[]
}

// --- PTE Telemetry & Scoring ---

export enum TestType {
  ACADEMIC = 'ACADEMIC',
  CORE = 'CORE',
}

export enum TestSection {
  READING = 'READING',
  WRITING = 'WRITING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
}

export enum QuestionType {
  // Speaking
  PERSONAL_INTRODUCTION = 'personal_introduction',
  READ_ALOUD = 'read_aloud',
  REPEAT_SENTENCE = 'repeat_sentence',
  DESCRIBE_IMAGE = 'describe_image',
  RE_TELL_LECTURE = 'retell_lecture',
  ANSWER_SHORT_QUESTION = 'answer_short_question',
  RESPOND_TO_A_SITUATION = 'respond_to_situation',
  SUMMARIZE_GROUP_DISCUSSION = 'summarize_group_discussion',

  // Writing
  SUMMARIZE_WRITTEN_TEXT = 'summarize_written_text',
  WRITE_ESSAY = 'essay',
  WRITE_EMAIL = 'email',

  // Reading
  READING_WRITING_BLANKS = 'reading_fill_blanks_dropdown',
  MULTIPLE_CHOICE_SINGLE = 'reading_mc_single',
  MULTIPLE_CHOICE_MULTIPLE = 'reading_mc_multiple',
  REORDER_PARAGRAPHS = 'reorder_paragraphs',
  READING_BLANKS = 'reading_fill_blanks_drag',

  // Listening
  SUMMARIZE_SPOKEN_TEXT = 'summarize_spoken_text',
  LISTENING_MULTIPLE_CHOICE_MULTIPLE = 'listening_mc_multiple',
  LISTENING_BLANKS = 'listening_fill_blanks',
  HIGHLIGHT_CORRECT_SUMMARY = 'highlight_correct_summary',
  LISTENING_MULTIPLE_CHOICE_SINGLE = 'listening_mc_single',
  SELECT_MISSING_WORD = 'select_missing_word',
  HIGHLIGHT_INCORRECT_WORDS = 'highlight_incorrect_words',
  WRITE_FROM_DICTATION = 'write_from_dictation',
}

// Speaking question types
export type SpeakingType =
  | QuestionType.READ_ALOUD
  | QuestionType.REPEAT_SENTENCE
  | QuestionType.DESCRIBE_IMAGE
  | QuestionType.RE_TELL_LECTURE
  | QuestionType.ANSWER_SHORT_QUESTION
  | QuestionType.RESPOND_TO_A_SITUATION
  | QuestionType.SUMMARIZE_GROUP_DISCUSSION

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
}

export interface WordMarking {
  word: string
  classification: 'good' | 'average' | 'poor' | 'pause' | 'omitted' | 'inserted' | 'filler'
  feedback?: string
}

export interface AIFeedbackData {
  overallScore: number
  maxScore?: number
  pronunciation?: {
    score: number
    feedback: string
  }
  fluency?: {
    score: number
    feedback: string
  }
  grammar?: {
    score: number
    feedback: string
  }
  vocabulary?: {
    score: number
    feedback: string
  }
  content?: {
    score: number
    feedback: string
  }
  spelling?: {
    score: number
    feedback: string
  }
  accuracy?: {
    score: number
    feedback: string
  }
  form?: { // Added form for writing/summarizing
    score: number
    feedback: string
  }
  structure?: { // Added structure for writing
    score: number,
    feedback: string
  }
  wordMarking?: WordMarking[]
  suggestions: string[]
  strengths: string[]
  areasForImprovement: string[]
  transcript?: string
  // Enhanced scoring metrics from RAG pipeline
  scoringMetrics?: {
    lexicalScore: number      // 0-100 vocabulary/text quality
    semanticScore: number     // 0-100 benchmark similarity
    fluencyScore: number      // 0-100 fluency assessment
    calculatedPteScore: number // 10-90 calculated PTE score
    confidence: number        // 0-100 scoring confidence
  }
  wordCount?: number
}

// Specific Speaking Feedback Data type (reusing AIFeedbackData)
export type SpeakingFeedbackData = AIFeedbackData;

// --- Question Domain Models ---

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface BasePteQuestion {
  id: string
  title: string
  content: string | null
  audioUrl?: string | null
  imageUrl?: string | null
  difficulty: Difficulty
  isPremium: boolean
  questionTypeId: string
  questionType?: {
    id: string
    code: string
    name: string
    description: string | null
    timeLimit: number | null
  }
  userStatus?: 'unpracticed' | 'completed' | 'mistake'
  lastScore?: number
}

export interface ReadingQuestion extends BasePteQuestion {
  reading: {
    passageText: string
    questionText: string | null
    options: {
      choices?: string[]
      blanks?: { position: number; options: string[] }[]
      paragraphs?: string[]
      [key: string]: any
    } | null
    correctAnswerPositions: number[] | null
    explanation?: string | null
  }
}

export interface SpeakingQuestion extends BasePteQuestion {
  speaking?: {
    audioPromptUrl: string | null
    expectedDuration: number | null
    sampleTranscript: string | null
    keyPoints: string[] | null
  }
}

export interface WritingQuestion extends BasePteQuestion {
  writing?: {
    promptText: string
    passageText: string | null
    wordCountMin: number
    wordCountMax: number
    essayType: string | null
    keyThemes: string[] | null
  }
}

export interface ListeningQuestion extends BasePteQuestion {
  listening?: {
    audioFileUrl: string
    audioDuration: number | null
    transcript: string | null
    questionText: string | null
    options: any
    correctAnswerPositions: number[] | null
  }
}

// Re-export for practice list consistency
export type PracticeQuestion = BasePteQuestion;

// --- User Progress & History ---

export interface TestAttemptWithDetails {
  id: string
  testId: string
  testTitle: string
  testType: TestType
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: Date
  completedAt?: Date
  totalScore?: number
  readingScore?: number
  writingScore?: number
  listeningScore?: number
  speakingScore?: number
  answers?: TestAnswerWithFeedback[]
}

export interface AnswerData {
  selectedOption?: string
  selectedOptions?: string[]
  textAnswer?: string
  audioRecordingUrl?: string
  orderedParagraphs?: string[]
  filledBlanks?: { [key: string]: string }
}

export interface TestAnswerWithFeedback {
  id: string
  questionId: string
  question: string
  section: TestSection
  questionType: QuestionType
  userAnswer: AnswerData
  isCorrect?: boolean
  pointsEarned?: number
  aiFeedback?: AIFeedbackData
  submittedAt: Date
}

export interface UserProgressData {
  totalTestsTaken: number
  averageScore: number
  sectionScores: {
    reading: number
    writing: number
    listening: number
    speaking: number
  }
  recentAttempts: TestAttemptWithDetails[]
}

// Speaking system specific types

export interface SpeakingTimings {
  prepMs?: number
  recordMs: number
  startAt?: string
  endAt?: string
}

export interface SpeakingScoreDetails {
  content: number // 0-5 scale (official PTE Academic)
  pronunciation: number // 0-5 scale (official PTE Academic)
  fluency: number // 0-5 scale (official PTE Academic)
  total: number // calculated aggregate score (0-90 for overall enabling skills)
  rubric?: Record<string, unknown>
}

// --- Routes & API ---

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RouteEntry {
  id: string
  path: string
  method: HttpMethod
  builder: 'api' | 'academic' | 'upload' | 'ai-scoring'
  handler: string
}

export type RouteHandler = (req: Request) => Promise<Response>

export interface RouteBuilder {
  register(id: string, path: string, method: HttpMethod, handler: RouteHandler): void
}

// --- Data Categories (for Mocks/Constants) ---

export interface PTERouteCategory {
  id: number
  title: string
  description: string
  icon: string
  code: string
  scoring_type: 'auto' | 'ai'
  short_name: string
  first_question_id: number | null
  color: string
  parent: number | null
  practice_count: number
  question_count: number
  video_link: string
}

export interface BenchmarkResponse {
  id: string;
  questionType: string;
  response: string;
  score: number;
  features: {
    fluency: number;
    pronunciation?: number;
    content: number;
    vocabulary: number;
    grammar: number;
  };
}