// Consolidated Types for User, Practice, PTE, and Core System

// --- User & Auth ---
export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
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
  READ_ALOUD = 'Read Aloud',
  REPEAT_SENTENCE = 'Repeat Sentence',
  DESCRIBE_IMAGE = 'Describe Image',
  RE_TELL_LECTURE = 'Re-tell Lecture',
  ANSWER_SHORT_QUESTION = 'Answer Short Question',
  RESPOND_TO_A_SITUATION = 'Respond to a Situation',
  SUMMARIZE_GROUP_DISCUSSION = 'Summarize Group Discussion',

  // Writing
  SUMMARIZE_WRITTEN_TEXT = 'Summarize Written Text',
  WRITE_ESSAY = 'Write Essay',

  // Reading
  READING_WRITING_BLANKS = 'Reading & Writing: Fill in the Blanks',
  MULTIPLE_CHOICE_SINGLE = 'Multiple Choice, Choose Single Answer',
  MULTIPLE_CHOICE_MULTIPLE = 'Multiple Choice, Choose Multiple Answers',
  REORDER_PARAGRAPHS = 'Re-order Paragraphs',
  READING_BLANKS = 'Reading: Fill in the Blanks',

  // Listening
  SUMMARIZE_SPOKEN_TEXT = 'Summarize Spoken Text',
  LISTENING_MULTIPLE_CHOICE_MULTIPLE = 'Listening: Multiple Choice, Choose Multiple Answers',
  LISTENING_BLANKS = 'Fill in the Blanks',
  HIGHLIGHT_CORRECT_SUMMARY = 'Highlight Correct Summary',
  LISTENING_MULTIPLE_CHOICE_SINGLE = 'Listening: Multiple Choice, Choose Single Answer',
  SELECT_MISSING_WORD = 'Select Missing Word',
  HIGHLIGHT_INCORRECT_WORDS = 'Highlight Incorrect Words',
  WRITE_FROM_DICTATION = 'Write from Dictation',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
}

export interface QuestionData {
  options?: string[]
  audioUrl?: string
  imageUrl?: string
  paragraphs?: string[]
  wordBank?: string[]
  transcript?: string
  timeLimit?: number // in seconds
}

export interface AnswerData {
  selectedOption?: string
  selectedOptions?: string[]
  textAnswer?: string
  audioRecordingUrl?: string
  orderedParagraphs?: string[]
  filledBlanks?: { [key: string]: string }
}

export interface AIFeedbackData {
  overallScore: number
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
  structure?: { // Added structure for writing
    score: number,
    feedback: string
  }
  suggestions: string[]
  strengths: string[]
  areasForImprovement: string[]
}

// Specific Speaking Feedback Data type (reusing AIFeedbackData)
export type SpeakingFeedbackData = AIFeedbackData;


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

export interface UserProgress {
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

// Speaking system core types

export type SpeakingType =
  | 'read_aloud'
  | 'repeat_sentence'
  | 'describe_image'
  | 'retell_lecture'
  | 'answer_short_question'
  | 'summarize_group_discussion'
  | 'respond_to_a_situation'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

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

// Speaking Question interface (Database-like structure)
export interface SpeakingQuestion {
  id: string
  type: SpeakingType
  title: string
  promptText?: string | null
  imageUrl?: string | null
  audioUrl?: string | null
  difficulty?: Difficulty | null
  isActive?: boolean | null
  questionData?: QuestionData | null
  createdAt?: Date | null
  updatedAt?: Date | null
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