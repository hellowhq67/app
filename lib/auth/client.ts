import { createAuthClient } from "better-auth/react"

// Create auth client with proper configuration
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
             (typeof window !== 'undefined' ? window.location.origin : ''),
    fetchOptions: {
        credentials: 'include', // Include cookies in requests
    },
})

// Custom hook for auth state
export const useAuth = () => {
    const session = authClient.useSession()

    return {
        ...session,
        user: session.data?.user,
        session: session.data?.session,
        isAuthenticated: !!session.data?.user,
        isLoading: session.isPending,
        isPending: session.isPending,
        error: session.error,
        // Refresh session manually if needed
        refetch: () => session.refetch?.(),
    }
}

// Export individual methods for convenience
export const signIn = authClient.signIn
export const signUp = authClient.signUp
export const signOut = authClient.signOut
export const useSession = authClient.useSession
