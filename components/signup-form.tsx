'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpAction } from '@/lib/auth/actions'
import { useGoogleAuthModal } from '@/components/auth/google-auth-modal'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

/**
 * Renders a form submit button that displays a spinner, changes its label, and becomes disabled while the parent form is pending.
 *
 * @returns The submit button element.
 */
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Creating account...' : 'Create Account'}
    </Button>
  )
}

/**
 * Render the sign-up form with client-side password confirmation, social sign-in, and action-backed submission.
 *
 * Performs client-side validation for matching passwords and a minimum length, displays local or server-provided errors, and submits form data via the configured signUpAction. Also exposes Google social sign-in flow that redirects to /pte/dashboard with a popup modal.
 *
 * @returns A React element containing the sign-up form UI
 */
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  // Use useActionState for form state management
  const [state, formAction] = useActionState(signUpAction, null)
  // Local state for password confirmation (client-side validation)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const { GoogleAuthModal, openSignUpModal } = useGoogleAuthModal()

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            action={async (formData) => {
              setLocalError('')
              const password = (formData.get('password') as string) || ''
              // Client-side validation
              if (password !== confirmPassword) {
                setLocalError('Passwords do not match')
                return
              }
              if (password.length < 8) {
                setLocalError('Password must be at least 8 characters long')
                return
              }
              await formAction(formData)
            }}
          >
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>

              {(state?.error || localError) && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                  {localError || state?.error}
                </div>
              )}

              <input type="hidden" name="redirect" value="/pte/dashboard" />

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  defaultValue={(state as any)?.name || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  defaultValue={(state as any)?.email || ''}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to contact you. We will not share your
                  email with anyone else.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="col-span-2 text-xs text-muted-foreground">
                  Must be at least 8 characters long.
                </p>
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

              <Button
                variant="outline"
                type="button"
                onClick={openSignUpModal}
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

              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <a href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/placeholder.svg"
              alt="Image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="absolute inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <p className="px-6 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{' '}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>

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