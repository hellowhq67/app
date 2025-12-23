'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile, PracticeSession } from "@/lib/types"

// OLD INTEGRATION: we are moving practice state to practice-store.ts
// This store now handles ONLY User, Auth, and Global App Context

interface AppStore {
  // User State (from database)
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Navigation / Global UI State
  isSidebarOpen: boolean

  // Session History (Global)
  // We keep sessions here as a simple list for the profile/dashboard
  // detailed session logic lives in practice-store or DB queries
  sessions: PracticeSession[]

  // Actions
  setUser: (user: UserProfile | null) => void
  addSession: (session: PracticeSession) => void
  incrementDailyUsage: () => void
  checkRateLimit: () => boolean
  initializeUser: () => Promise<void>
  setSidebarOpen: (isOpen: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSidebarOpen: true,
      sessions: [],

      // Actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),

      incrementDailyUsage: () =>
        set((state) => {
          if (!state.user) return state
          return {
            user: {
              ...state.user,
              rateLimit: {
                ...state.user.rateLimit,
                dailyQuestionsUsed: state.user.rateLimit.dailyQuestionsUsed + 1,
              },
            },
          }
        }),

      checkRateLimit: () => {
        const { user } = get()
        if (!user) return false
        const { dailyQuestionsUsed, dailyQuestionsLimit } = user.rateLimit
        if (dailyQuestionsLimit === -1) return true // Unlimited
        return dailyQuestionsUsed < dailyQuestionsLimit
      },

      // Initialize user from database authentication
      initializeUser: async () => {
        set({ isLoading: true })
        try {
          // Fetch user profile from database
          const response = await fetch('/api/user')
          if (response.ok) {
            const userProfile = await response.json()
            set({
              user: {
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                avatar: userProfile.image || '/avatars/default.png',
                rateLimit: {
                  dailyQuestionsUsed: userProfile.aiCreditsUsed || 0,
                  dailyQuestionsLimit: userProfile.dailyAiCredits || 10,
                }
              },
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Error initializing user:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },
    }),
    {
      name: "pte-master-app-store", // Updated name to avoid conflict with old store
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessions: state.sessions,
      }),
    },
  )
)