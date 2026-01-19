"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const DEFAULT_REDIRECT = "/pte/dashboard"

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = formData.get("redirect") as string || DEFAULT_REDIRECT

  if (!email || !password) {
    return { error: "Email and password are required", email }
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers()
    })
  } catch (error: any) {
     if (error?.status === 403 && error?.body?.message === "Email not verified") {
         return { error: "Please verify your email address", email }
     }
     return { error: error?.message || "Invalid email or password", email }
  }

  redirect(redirectTo)
}

export async function signUpAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = formData.get("redirect") as string || DEFAULT_REDIRECT

  if (!email || !password || !name) {
    return { error: "All fields are required", email, name }
  }

  try {
     await auth.api.signUpEmail({
        body: {
            name,
            email,
            password
        },
        headers: await headers()
     })
  } catch (error: any) {
      return { error: error?.message || "Failed to create account", email, name }
  }

  redirect(redirectTo)
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers()
  })
  redirect("/sign-in")
}

// Note: Forgot password and reset password are handled via API routes
// /api/auth/forgot-password and /api/auth/reset-password
// These server actions can be used for form submissions if needed

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to send reset email")
    }

    return { success: true, message: "Password reset email sent. Please check your inbox." }
  } catch (error: any) {
    // Always return success to prevent email enumeration
    return { success: true, message: "If an account exists, a password reset email has been sent." }
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string
  const newPassword = formData.get("newPassword") as string

  if (!token || !newPassword) {
    return { error: "Token and new password are required" }
  }

  try {
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to reset password")
    }

    return { success: true, message: "Password reset successfully. You can now sign in." }
  } catch (error: any) {
    return { error: error?.message || "Failed to reset password" }
  }
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const revokeOtherSessions = formData.get("revokeOtherSessions") === "true"

  if (!currentPassword || !newPassword) {
    return { error: "Current and new password are required" }
  }

  try {
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await headers()),
      },
      body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to change password")
    }

    return { success: true, message: "Password changed successfully." }
  } catch (error: any) {
    return { error: error?.message || "Failed to change password" }
  }
}
