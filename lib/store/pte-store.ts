import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface PracticeState {
  currentSection: string | null
  currentQuestion: number
  answers: Record<string, unknown>
  timeRemaining: number
  isPaused: boolean
}

interface PracticeStore extends PracticeState {
  setCurrentSection: (section: string) => void
  setCurrentQuestion: (question: number) => void
  setAnswer: (questionId: string, answer: unknown) => void
  setTimeRemaining: (time: number) => void
  setPaused: (paused: boolean) => void
  resetPractice: () => void
}

const initialState: PracticeState = {
  currentSection: null,
  currentQuestion: 0,
  answers: {},
  timeRemaining: 0,
  isPaused: false,
}

export const usePracticeStore = create<PracticeStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setCurrentSection: (section) => set({ currentSection: section }),
        setCurrentQuestion: (question) => set({ currentQuestion: question }),
        setAnswer: (questionId, answer) =>
          set((state) => ({
            answers: { ...state.answers, [questionId]: answer },
          })),
        setTimeRemaining: (time) => set({ timeRemaining: time }),
        setPaused: (paused) => set({ isPaused: paused }),
        resetPractice: () => set(initialState),
      }),
      {
        name: 'pte-practice-storage',
      }
    )
  )
)
