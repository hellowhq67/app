import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
})

export const useAuth = () => {
    const session = authClient.useSession()
    return {
        ...session,
        user: session.data?.user,
        isAuthenticated: !!session.data?.user
    }
}