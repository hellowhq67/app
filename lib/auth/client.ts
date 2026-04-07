import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

// Create auth client with admin plugin
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  plugins: [adminClient()],
})

// Custom hook for auth state
export const useAuth = () => {
  const session = authClient.useSession()
  const user = session.data?.user
  return {
    ...session,
    user,
    isAuthenticated: !!user,
    isLoading: session.isPending,
    isPending: session.isPending,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isBanned: user?.banned === true,
    role: user?.role ?? 'user',
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

// Admin plugin methods (user management, role assignment, ban/unban)
export const authAdmin = authClient.admin

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
  try {
    const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || "Failed to send reset email")
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your connection and try again.")
    }
    throw error
  }
}

// Reset password - calls API endpoint
export async function confirmPasswordReset(token: string, newPassword: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  try {
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      if (data.code === 'TOKEN_EXPIRED') {
        throw new Error("Your reset link has expired. Please request a new one.")
      }
      throw new Error(data.error || "Failed to reset password")
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your connection and try again.")
    }
    throw error
  }
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
    const data = await response.json().catch(() => ({}))
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
  const result = await getSession()
  const email = result?.data?.user?.email
  if (!email) {
    throw new Error('No user session found')
  }

  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const response = await fetch(`${baseUrl}/api/auth/send-verification-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to resend verification email')
  }

  return response.json()
}
