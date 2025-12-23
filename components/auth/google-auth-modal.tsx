'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/auth-client'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface GoogleAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mode: 'signin' | 'signup'
  redirectUrl?: string
}

type AuthStep = 'initial' | 'loading' | 'success' | 'error'

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  redirectUrl = '/pte/dashboard',
}: GoogleAuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('initial')
  const [error, setError] = useState<string>('')

  const handleGoogleAuth = async () => {
    try {
      setCurrentStep('loading')
      setError('')

      // Use better-auth client for Google OAuth
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${redirectUrl}?auth=success&provider=google&mode=${mode}`,
      })

      // Note: The actual success handling will happen via redirect
      // This is just for UI state management
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(
        err?.message ||
        'Failed to authenticate with Google. Please try again.'
      )
      setCurrentStep('error')
    }
  }

  const handleRetry = () => {
    setCurrentStep('initial')
    setError('')
  }

  const handleClose = () => {
    setCurrentStep('initial')
    setError('')
    onClose()
  }

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('initial')
      setError('')
    }
  }, [isOpen])

  const getStepContent = () => {
    switch (currentStep) {
      case 'initial':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 h-8 text-blue-600"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Continue with Google
              </h3>
              <p className="text-muted-foreground text-sm">
                {mode === 'signin' 
                  ? 'Sign in to your account using your Google account'
                  : 'Create your account using your Google account'
                }
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleGoogleAuth}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )

      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Authenticating...
              </h3>
              <p className="text-muted-foreground text-sm">
                Please wait while we verify your Google account
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Connecting to Google
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    This may take a few seconds
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/20">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-green-900 dark:text-green-100">
                Authentication Successful!
              </h3>
              <p className="text-muted-foreground text-sm">
                Redirecting you to your dashboard...
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Welcome to PTE Learning!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Your account has been verified
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/20">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">
                Authentication Failed
              </h3>
              <p className="text-muted-foreground text-sm">
                {error}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    What went wrong?
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 mt-1 space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Ensure you granted necessary permissions</li>
                    <li>• Try again or use email/password</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'signin' ? 'Sign In with Google' : 'Sign Up with Google'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' 
              ? 'Authenticate using your Google account'
              : 'Create your account using Google'
            }
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {getStepContent()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easy integration
export function useGoogleAuthModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openSignInModal = () => {
    setAuthMode('signin')
    setIsModalOpen(true)
  }

  const openSignUpModal = () => {
    setAuthMode('signup')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return {
    isModalOpen,
    authMode,
    openSignInModal,
    openSignUpModal,
    closeModal,
    GoogleAuthModal: (props: Omit<GoogleAuthModalProps, 'isOpen' | 'onClose' | 'mode'>) => (
      <GoogleAuthModal
        {...props}
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={authMode}
      />
    )
  }
}