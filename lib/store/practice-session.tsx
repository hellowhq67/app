'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { SpeakingScore } from '@/lib/types'

type PracticeType = 'speaking' | 'writing' | 'reading' | 'listening'

interface PracticeState {
  currentQuestionIndex: number
  score: SpeakingScore | null
  isScoring: boolean
  section: PracticeType | null
  questionType: string | null
  questions: any[]
  audioBlob: Blob | null
  textAnswer: string
}

type PracticeAction =
  | { type: 'SET_CURRENT_QUESTION_INDEX'; payload: number }
  | { type: 'SET_SCORE'; payload: SpeakingScore | null }
  | { type: 'SET_IS_SCORING'; payload: boolean }
  | { type: 'SET_SECTION'; payload: PracticeType }
  | { type: 'SET_QUESTION_TYPE'; payload: string }
  | { type: 'SET_QUESTIONS'; payload: any[] }
  | { type: 'SET_AUDIO_BLOB'; payload: Blob | null }
  | { type: 'SET_TEXT_ANSWER'; payload: string }
  | { type: 'RESET_STATE' }

const initialState: PracticeState = {
  currentQuestionIndex: 0,
  score: null,
  isScoring: false,
  section: null,
  questionType: null,
  questions: [],
  audioBlob: null,
  textAnswer: ''
}

const PracticeContext = createContext<{
  state: PracticeState;
  dispatch: React.Dispatch<PracticeAction>;
}>({
  state: initialState,
  dispatch: () => {},
})

const practiceReducer = (state: PracticeState, action: PracticeAction): PracticeState => {
  switch (action.type) {
    case 'SET_CURRENT_QUESTION_INDEX':
      return { ...state, currentQuestionIndex: action.payload }
    case 'SET_SCORE':
      return { ...state, score: action.payload }
    case 'SET_IS_SCORING':
      return { ...state, isScoring: action.payload }
    case 'SET_SECTION':
      return { ...state, section: action.payload }
    case 'SET_QUESTION_TYPE':
      return { ...state, questionType: action.payload }
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload }
    case 'SET_AUDIO_BLOB':
      return { ...state, audioBlob: action.payload }
    case 'SET_TEXT_ANSWER':
      return { ...state, textAnswer: action.payload }
    case 'RESET_STATE':
      return { ...initialState }
    default:
      return state
  }
}

interface PracticeProviderProps {
  children: ReactNode
}

export function PracticeProvider({ children }: PracticeProviderProps) {
  const [state, dispatch] = useReducer(practiceReducer, initialState)

  return (
    <PracticeContext.Provider value={{ state, dispatch }}>
      {children}
    </PracticeContext.Provider>
  )
}

export function usePractice() {
  const context = useContext(PracticeContext)
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider')
  }
  return context
}