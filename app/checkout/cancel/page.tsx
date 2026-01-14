'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const tranId = searchParams.get('tran_id')

  const getReasonMessage = () => {
    switch (reason) {
      case 'payment_failed':
        return 'Your payment could not be processed. Please check your payment details and try again.'
      case 'user_cancelled':
        return 'You cancelled the payment. No charges have been made to your account.'
      case 'validation_failed':
        return 'Payment verification failed. Please contact support if this persists.'
      case 'processing_error':
        return 'There was an error processing your payment. Please try again or contact support.'
      default:
        return 'Your checkout was cancelled. No charges have been made to your account.'
    }
  }

  const showContactSupport = reason === 'payment_failed' || reason === 'validation_failed' || reason === 'processing_error'

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${
                showContactSupport ? 'bg-red-100' : 'bg-orange-100'
              } rounded-full flex items-center justify-center mx-auto mb-4`}>
                <XCircle className={`h-8 w-8 ${
                  showContactSupport ? 'text-red-600' : 'text-orange-600'
                }`} />
              </div>
              <Badge className="mb-4" variant="outline">
                {showContactSupport ? 'Payment Failed' : 'Checkout Cancelled'}
              </Badge>
              <CardTitle className="text-2xl mb-2">
                {showContactSupport ? 'Payment Processing Failed' : 'No worries, you can try again anytime'}
              </CardTitle>
              <CardDescription>
                {getReasonMessage()}
              </CardDescription>
              {tranId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Transaction ID: {tranId}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Why continue */}
              <div>
                <h3 className="font-semibold mb-3">Why upgrade to Pro or Premium?</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Unlimited mock tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Detailed analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Priority AI scoring</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Personalized study plans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Advanced progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Teacher review access</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pricing
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant={showContactSupport ? 'default' : 'outline'} className="w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {showContactSupport ? 'Contact Support' : 'Need Help?'}
                  </Button>
                </Link>
              </div>

              {/* SSL Commerz Support Info */}
              {showContactSupport && tranId && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Payment Support</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    If you need assistance with your payment, please provide the transaction ID ({tranId}) when contacting support.
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                    Email: pedagogistspte@gmail.com
                  </p>
                </div>
              )}

              {/* FAQ */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Common Questions</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Can I try before buying?</span>
                    <p className="text-muted-foreground">Yes! Start with our free plan and upgrade anytime.</p>
                  </div>
                  <div>
                    <span className="font-medium">Is there a money-back guarantee?</span>
                    <p className="text-muted-foreground">We offer a 30-day money-back guarantee on all plans.</p>
                  </div>
                  <div>
                    <span className="font-medium">Can I cancel anytime?</span>
                    <p className="text-muted-foreground">Yes, cancel anytime with no penalties.</p>
                  </div>
                </div>
              </div>

              {/* Free features reminder */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Continue practicing with our{' '}
                  <Link href="/pte/dashboard" className="underline hover:no-underline font-medium">
                    free features
                  </Link>{' '}
                  while you consider upgrading.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}