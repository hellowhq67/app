'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    'pending' | 'active' | 'error'
  >('pending')

  const provider = searchParams.get('provider')
  const sessionId = searchParams.get('session_id')
  const tranId = searchParams.get('tran_id')

  useEffect(() => {
    // In a real implementation, you might want to verify the payment status
    // For now, we'll just simulate a successful subscription activation
    const checkSubscriptionStatus = async () => {
      try {
        // Simulate API call to check subscription status
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setSubscriptionStatus('active')
      } catch (error) {
        console.error('Failed to check subscription status:', error)
        setSubscriptionStatus('error')
      } finally {
        setIsLoading(false)
      }
    }

    if (
      (provider === 'polar' && sessionId) ||
      (provider === 'sslcommerz' && tranId)
    ) {
      checkSubscriptionStatus()
    } else {
      setIsLoading(false)
    }
  }, [provider, sessionId, tranId])

  if (isLoading) {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-b">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
            <h2 className="mb-2 text-xl font-semibold">
              Processing Your Subscription
            </h2>
            <p className="text-muted-foreground">
              Please wait while we activate your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (subscriptionStatus === 'error') {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-b">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-red-600">
              Payment Processing
            </h2>
            <p className="text-muted-foreground mb-6">
              There was an issue processing your subscription. Please contact
              support if this persists.
            </p>
            <div className="space-y-2">
              <Link href="/contact">
                <Button className="w-full">Contact Support</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full">
                  Back to Pricing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <Badge className="mb-4" variant="outline">
                Payment Successful
              </Badge>
              <CardTitle className="mb-2 text-2xl">
                Welcome to PTE Practice Platform!
              </CardTitle>
              <CardDescription>
                Your subscription has been activated successfully via{' '}
                {provider === 'sslcommerz' ? 'SSL Commerz' : 'Polar.sh'}. You
                now have access to all premium features.
              </CardDescription>
              {tranId && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Transaction ID: {tranId}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* What's Next */}
              <div>
                <h3 className="mb-3 font-semibold">What's Next?</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="text-primary h-4 w-4" />
                    <span>
                      Access unlimited mock tests and practice questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="text-primary h-4 w-4" />
                    <span>
                      Get detailed analytics and study recommendations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="text-primary h-4 w-4" />
                    <span>Enjoy priority AI scoring and feedback</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/pte/dashboard" className="flex-1">
                  <Button className="w-full">
                    Start Practicing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pte/mock-tests" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Take a Mock Test
                  </Button>
                </Link>
              </div>

              {/* Support Info */}
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Need help getting started? Check out our{' '}
                  <Link href="/blog" className="underline hover:no-underline">
                    tutorial guides
                  </Link>{' '}
                  or{' '}
                  <Link
                    href="/contact"
                    className="underline hover:no-underline"
                  >
                    contact support
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
