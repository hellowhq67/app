import { createAuthClient } from "better-auth/react"
import type { Auth } from "./auth"

// Create type-safe auth client
export const authClient = createAuthClient<Auth>({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
})

// Custom hook for auth state
export const useAuth = () => {
  const session = authClient.useSession()
  return {
    ...session,
    user: session.data?.user,
    isAuthenticated: !!session.data?.user,
    isLoading: session.isPending,
    isPending: session.isPending,
  }
}

// Export auth methods for easy access
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  revokeSession,
  revokeSessions,
  changeEmail,
  deleteUser,
} = authClient

// Sign out with redirect
export async function signOutAndRedirect(redirectTo: string = "/sign-in") {
  await authClient.signOut()
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo
  }
}

// Forgot password - calls API endpoint
export async function requestPasswordReset(email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to send reset email")
  }

  return response.json()
}

// Reset password - calls API endpoint
export async function confirmPasswordReset(token: string, newPassword: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to reset password")
  }

  return response.json()
}

// Change password - calls API endpoint
export async function updatePassword(
  currentPassword: string,
  newPassword: string,
  revokeOtherSessions: boolean = false
) {
  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const response = await fetch(`${baseUrl}/api/user/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to change password")
  }

  return response.json()
}

// Verify email
export async function verifyEmail(token: string) {
  const response = await authClient.$fetch('/verify-email', {
    method: 'POST',
    body: {
      token,
    },
  })

  return response
}

// Resend verification email
export async function resendVerificationEmail() {
  const session = await getSession()
  if (!session?.user?.email) {
    throw new Error('No user session found')
  }

  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const response = await fetch(`${baseUrl}/api/auth/send-verification-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: session.user.email }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to resend verification email')
  }

  return response.json()
}

// Type exports for convenience
export type Session = Awaited<ReturnType<typeof getSession>>
export type User = Session extends { user: infer U } ? U : never
