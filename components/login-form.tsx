'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInAction } from '@/lib/auth/actions'
import { useGoogleAuthModal } from '@/components/auth/google-auth-modal'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Render the form submit button with a loading indicator when the form is pending.
 *
 * The button is type="submit" and spans full width. While the form status is pending it is disabled,
 * shows a spinner, and displays "Signing in..."; otherwise it displays "Login".
 *
 * @returns The submit Button element for the login form.
 */
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Signing in...' : 'Login'}
    </Button>
  )
}

/**
 * Render the login form with email/password fields, a submit button, and Google social sign-in options.
 *
 * Displays an inline error banner when the sign-in action returns an error, preserves an email value from action state, includes a hidden redirect input to `/pte/dashboard`, and shows loading indicators while the form or Google provider is in progress.
 *
 * @returns The rendered login form element.
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  // Use useActionState hook (React 19.2) for form state management
  const [state, formAction] = useActionState(signInAction, null)
  const { GoogleAuthModal, openSignInModal } = useGoogleAuthModal()

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              {state?.error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                  {state.error}
                </div>
              )}

              <input type="hidden" name="redirect" value="/pte/dashboard" />

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  defaultValue={state?.email || ''}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>

              <SubmitButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={openSignInModal}
                  className="w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-5 w-5"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <a href="/sign-up" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        onSuccess={() => {
          // Handle successful authentication
          window.location.href = '/pte/dashboard'
        }}
      />
    </div>
  )
}
