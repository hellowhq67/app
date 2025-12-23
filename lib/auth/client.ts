'use client'

import { createAuthClient } from 'better-auth/react'
import { 
  adminClient, 
  oneTapClient, 
  multiSessionClient,
  customSessionClient
} from "better-auth/client/plugins"
import { toast } from 'sonner'
import type { auth } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    adminClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    }),
    customSessionClient<typeof auth>(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.')
      }
    },
  },
})

// Export commonly used functions
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  forgetPassword,
  resetPassword,
} = authClient

// Custom hook for auth state
export function useAuth() {
  const { data: session, isPending, error } = useSession()
  
  return {
    user: session?.user ?? null,
    session: session ?? null,
    isAuthenticated: !!session?.user,
    isPending,
    error,
  }
}
