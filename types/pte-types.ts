// PTE Academic Mock Test Type Definitions

export interface PTEQuestion {
  id: string;
  type: string;
  section: string;
  number: number;
  content: PTEQuestionContent;
  timing: PTETiming;
  instructions: string;
  hasAIScoring: boolean;
  audioRestrictions?: PTAudioRestrictions;
  wordCount?: PTEWordCount;
}

export interface PTEQuestionContent {
  // Common properties
  text?: string;
  question?: string;
  
  // Speaking questions
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  situation?: string;
  discussion?: PTEGroupDiscussion;
  
  // Reading questions
  passage?: string;
  options?: PTEOption[];
  wordBank?: string[];
  sentences?: string[];
  blanks?: PTEBlank[];
  
  // Listening questions
  transcript?: string;
  summaries?: string[];
}

export interface PTEGroupDiscussion {
  audioUrl: string;
  speakers: number;
  duration: number;
  topic: string;
}

export interface PTEOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface PTEBlank {
  id: string;
  position: number;
  options?: string[];
  correctAnswer?: string;
}

export interface PTETiming {
  preparation?: number;
  response: number;
  total: number;
}

export interface PTAudioRestrictions {
  maxPlays: number;
}

export interface PTEWordCount {
  min: number;
  max: number;
  target: number;
}

export interface PTEResponse {
  questionId: string;
  answer: string | string[] | PTEBlankAnswer[];
  timeSpent: number;
  timestamp: number;
}

export interface PTEBlankAnswer {
  blankId: string;
  answer: string;
}

export interface PTESession {
  id: string;
  userId: string;
  startTime: number;
  currentSection: string;
  currentQuestion: number;
  responses: PTEResponse[];
  timeRemaining: {
    [key: string]: number;
  };
  isCompleted: boolean;
  systemCheck: PTESystemCheck;
}

export interface PTESystemCheck {
  microphone: boolean;
  speakers: boolean;
  camera: boolean;
  browserCompatible: boolean;
  networkStable: boolean;
  photoUrl?: string;
}

export interface PTEScores {
  overall: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  communicativeSkills: {
    [key: string]: number;
  };
  questionScores: {
    [questionId: number]: PTEQuestionScore;
  };
}

export interface PTEQuestionScore {
  questionId: string;
  questionType: string;
  score: number;
  maxScore: number;
  aiFeedback?: PTEAIFeedback;
}

export interface PTEAIFeedback {
  pronunciation: number;
  fluency: number;
  content: number;
  grammar: number;
  vocabulary: number;
  spelling: number;
  coherence: number;
  comments: string[];
}

export interface PTEProgress {
  section: string;
  totalQuestions: number;
  completedQuestions: number;
  currentQuestion: number;
  timeRemaining: number;
}

export interface PTEConfig {
  enableAIScoring: boolean;
  enableAutoSave: boolean;
  enableSystemCheck: boolean;
  allowBreaks: boolean;
  examMode: boolean;
  timeWarnings: {
    warning: number; // seconds
    critical: number; // seconds
  };
}

export interface PTEError {
  type: 'audio' | 'network' | 'browser' | 'permission' | 'timeout' | 'submission';
  message: string;
  code?: string;
  recoverable: boolean;
  actions?: PTEErrorAction[];
}

export interface PTEErrorAction {
  label: string;
  action: 'retry' | 'skip' | 'continue' | 'contact_support';
  callback?: () => void;
}

export interface PTEComponentState {
  isLoading: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  hasError: boolean;
  errorMessage?: string;
  playCount: number;
  remainingTime: number;
  response?: string | string[] | PTEBlankAnswer[];
}

export interface PTETimerState {
  totalTime: number;
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  stage: 'preparation' | 'response' | 'completed';
}

export interface PTEAudioState {
  isRecording: boolean;
  isPlaying: boolean;
  audioBlob?: Blob;
  audioUrl?: string;
  volume: number;
  duration: number;
  currentTime: number;
  playCount: number;
  maxPlays: number;
}

export interface PTETextState {
  text: string;
  wordCount: number;
  characterCount: number;
  isValid: boolean;
  lastSaved: number;
  isDirty: boolean;
}

export interface PTEDragDropState {
  items: PTEDragItem[];
  droppedItems: PTEDragItem[];
  isDragging: boolean;
  draggedItem?: PTEDragItem;
  dropZones: PTEDropZone[];
}

export interface PTEDragItem {
  id: string;
  content: string;
  originalIndex: number;
  currentIndex?: number;
  isCorrect?: boolean;
}

export interface PTEDropZone {
  id: string;
  accepts: string[];
  items: PTEDragItem[];
  isValid: boolean;
}

export interface PTEMCQState {
  selectedOptions: string[];
  isMultiple: boolean;
  maxSelections?: number;
  isValid: boolean;
}

export interface PTEHighlightState {
  selectedText: string[];
  highlights: PTEHighlight[];
  isMultiple: boolean;
  maxHighlights?: number;
}

export interface PTEHighlight {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  type: 'correct' | 'incorrect';
}
