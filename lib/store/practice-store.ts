import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { TestSection, QuestionType } from '@/lib/types'

export type PracticeStatus =
  | 'idle'
  | 'preparing'
  | 'recording'
  | 'answering' // for reading/writing/listening non-audio
  | 'submitting'
  | 'submitted'
  | 'error'

interface PracticeState {
  // Context
  questionId: string | null
  questionType: QuestionType | null
  section: TestSection | null

  // Timer State
  isTimerRunning: boolean
  prepTimeRemaining: number // specific for speaking tasks usually
  recordTimeRemaining: number // specific for speaking tasks
  totalTimeRemaining: number // for other timed tasks

  // Interaction State
  status: PracticeStatus
  audioBlob: Blob | null
  textAnswer: string
  selectedOptions: string[] // For MCQ

  // Actions
  initializeSession: (qid: string, type: QuestionType, section: TestSection, prepTime?: number, recordTime?: number) => void
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void

  setPrepTime: (time: number) => void
  setRecordTime: (time: number) => void

  decrementPrepTime: () => void
  decrementRecordTime: () => void
  decrementTotalTime: () => void

  setStatus: (status: PracticeStatus) => void
  setAnswer: (ans: string | string[] | Blob) => void
  resetSession: () => void
}

export const usePracticeStore = create<PracticeState>()(
  devtools((set, get) => ({
    // Initial State
    questionId: null,
    questionType: null,
    section: null,

    isTimerRunning: false,
    prepTimeRemaining: 0,
    recordTimeRemaining: 0,
    totalTimeRemaining: 0,

    status: 'idle',
    audioBlob: null,
    textAnswer: '',
    selectedOptions: [],

    initializeSession: (qid, type, section, prepTime = 0, recordTime = 0) => {
      set({
        questionId: qid,
        questionType: type,
        section: section,
        prepTimeRemaining: prepTime,
        recordTimeRemaining: recordTime,
        status: 'idle',
        audioBlob: null,
        textAnswer: '',
        selectedOptions: [],
        isTimerRunning: false
      })
    },

    startTimer: () => set({ isTimerRunning: true }),
    pauseTimer: () => set({ isTimerRunning: false }),
    stopTimer: () => set({ isTimerRunning: false }),

    setPrepTime: (time) => set({ prepTimeRemaining: time }),
    setRecordTime: (time) => set({ recordTimeRemaining: time }),

    decrementPrepTime: () => {
      const { prepTimeRemaining } = get()
      if (prepTimeRemaining > 0) {
        set({ prepTimeRemaining: prepTimeRemaining - 1 })
      }
    },

    decrementRecordTime: () => {
      const { recordTimeRemaining } = get()
      if (recordTimeRemaining > 0) {
        set({ recordTimeRemaining: recordTimeRemaining - 1 })
      }
    },

    decrementTotalTime: () => {
      const { totalTimeRemaining } = get()
      if (totalTimeRemaining > 0) {
        set({ totalTimeRemaining: totalTimeRemaining - 1 })
      }
    },

    setStatus: (status) => set({ status }),

    setAnswer: (ans) => {
      if (ans instanceof Blob) {
        set({ audioBlob: ans })
      } else if (Array.isArray(ans)) {
        set({ selectedOptions: ans })
      } else {
        set({ textAnswer: ans })
      }
    },

    resetSession: () => {
      set({
        questionId: null,
        questionType: null,
        section: null,
        isTimerRunning: false,
        prepTimeRemaining: 0,
        recordTimeRemaining: 0,
        totalTimeRemaining: 0,
        status: 'idle',
        audioBlob: null,
        textAnswer: '',
        selectedOptions: []
      })
    }
  }))
)
