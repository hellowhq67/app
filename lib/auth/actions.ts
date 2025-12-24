"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = formData.get("redirect") as string || "/pte/dashboard"

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
  const redirectTo = formData.get("redirect") as string || "/pte/dashboard"

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

  // Assuming auto-sign in is handled or we redirect to dashboard
  redirect(redirectTo)
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers()
  })
  redirect("/")
}
