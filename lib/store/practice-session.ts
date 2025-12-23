import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type PracticeType = 'speaking' | 'writing' | 'reading' | 'listening'
export type SessionStatus = 'idle' | 'preparing' | 'recording' | 'answering' | 'submitting' | 'completed'

interface PracticeSessionState {
  // Context
  questionId: string | null
  questionType: string | null
  practiceType: PracticeType | null
  
  // Status
  status: SessionStatus
  isSubmitting: boolean
  
  // Data
  audioBlob: Blob | null
  textAnswer: string
  selectedOptions: any // For MCQ etc.
  
  // Result
  result: any | null // Score object
  attempts: any[] // History
  
  // Actions
  initSession: (qid: string, qType: string, pType: PracticeType) => void
  setRecording: (blob: Blob) => void
  setTextAnswer: (text: string) => void
  setOptions: (options: any) => void
  setStatus: (status: SessionStatus) => void
  submitAttempt: (submitFn: () => Promise<any>) => Promise<void>
  resetSession: () => void
}

export const usePracticeSession = create<PracticeSessionState>()(
  devtools((set, get) => ({
    questionId: null,
    questionType: null,
    practiceType: null,
    
    status: 'idle',
    isSubmitting: false,
    
    audioBlob: null,
    textAnswer: '',
    selectedOptions: null,
    
    result: null,
    attempts: [],

    initSession: (qid, qType, pType) => {
      set({
        questionId: qid,
        questionType: qType,
        practiceType: pType,
        status: 'idle',
        result: null,
        textAnswer: '',
        audioBlob: null,
        selectedOptions: null
      })
    },

    setRecording: (blob) => set({ audioBlob: blob, status: 'answering' }),
    setTextAnswer: (text) => set({ textAnswer: text, status: 'answering' }),
    setOptions: (options) => set({ selectedOptions: options, status: 'answering' }),
    
    setStatus: (status) => set({ status }),

    submitAttempt: async (submitFn) => {
      const { status } = get()
      if (status === 'submitting') return

      set({ isSubmitting: true, status: 'submitting' })
      
      try {
        const result = await submitFn()
        set({ result, status: 'completed', isSubmitting: false })
      } catch (error) {
        console.error("Submission failed", error)
        set({ status: 'answering', isSubmitting: false }) // Revert to answering on fail
        throw error
      }
    },

    resetSession: () => set({
      status: 'idle',
      result: null,
      audioBlob: null,
      textAnswer: '',
      selectedOptions: null
    })
  }))
)
