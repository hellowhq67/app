'use client'

import { Suspense, useState, useEffect } from 'react'
import { BillingScreen } from '@/components/billingsdk/billing-screen'
import { PaymentMethodsSection } from '@/components/billingsdk/payment-methods-section'
import { InvoiceList } from '@/components/billingsdk/invoice-list'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/client'
import { toast } from 'sonner'

interface BillingData {
  planName: string
  planPrice: string
  renewalDate: string
  totalBalance: string
  username: string
  giftedCredits: string
  monthlyCredits: string
  monthlyCreditsLimit: string
  purchasedCredits: string
  resetDays: number
  autoRechargeEnabled: boolean
}

export default function BillingPage() {
  const { user, isAuthenticated } = useAuth()
  const [billingData, setBillingData] = useState<BillingData>({
    planName: 'Pro Plan',
    planPrice: '$29.99/mo',
    renewalDate: 'Feb 1, 2026',
    totalBalance: '$29.99',
    username: user?.email || 'user@example.com',
    giftedCredits: '$0.00',
    monthlyCredits: '$20.00',
    monthlyCreditsLimit: '$30.00',
    purchasedCredits: '$9.99',
    resetDays: 30,
    autoRechargeEnabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        if (!isAuthenticated || !user?.id) return

        // TODO: Replace with actual API call to fetch user's subscription and billing data
        // const response = await fetch(`/api/billing/${user.id}`)
        // const data = await response.json()
        // setBillingData(data)

        // For now, set from user session
        setBillingData(prev => ({
          ...prev,
          username: user?.email || prev.username,
        }))
      } catch (error) {
        console.error('Failed to fetch billing data:', error)
        toast.error('Failed to load billing information')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchBillingData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id, user?.email])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view billing information</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl mx-auto px-4 space-y-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-black tracking-tight">Billing & Subscription</h1>
          <p className="text-lg text-muted-foreground">Manage your subscription plan and payment methods</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Billing Screen */}
            <Suspense fallback={<div className="h-96 bg-secondary rounded-lg animate-pulse" />}>
              <BillingScreen
                planName={billingData.planName}
                planPrice={billingData.planPrice}
                renewalDate={billingData.renewalDate}
                totalBalance={billingData.totalBalance}
                username={billingData.username}
                giftedCredits={billingData.giftedCredits}
                monthlyCredits={billingData.monthlyCredits}
                monthlyCreditsLimit={billingData.monthlyCreditsLimit}
                purchasedCredits={billingData.purchasedCredits}
                resetDays={billingData.resetDays}
                autoRechargeEnabled={billingData.autoRechargeEnabled}
                onViewPlans={() => toast.success('View plans feature coming soon')}
                onCancelPlan={() => {
                  if (window.confirm('Are you sure you want to cancel your subscription?')) {
                    toast.success('Subscription cancellation initiated')
                  }
                }}
                onBuyCredits={() => toast.success('Credit purchase coming soon')}
                onEnableAutoRecharge={() => toast.success('Auto-recharge toggled')}
              />
            </Suspense>

            {/* Payment Methods */}
            <Suspense fallback={<div className="h-48 bg-secondary rounded-lg animate-pulse" />}>
              <PaymentMethodsSection />
            </Suspense>

            {/* Invoice List */}
            <Suspense fallback={<div className="h-96 bg-secondary rounded-lg animate-pulse" />}>
              <InvoiceList />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cancel your subscription and lose access to premium features. Your data will be retained for 30 days.
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (window.confirm('Are you sure? This action cannot be undone.')) {
                      toast.success('Subscription cancellation initiated')
                    }
                  }}
                >
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
