import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/api'
import { upsertUserSubscription } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const _signature = request.headers.get('polar-signature') || ''

    // Polar.sh uses standard webhook signatures - implement verification if needed
    const event = JSON.parse(body)

    console.log('Polar webhook received:', event.type, event.data)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data)
        break

      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return apiSuccess({ received: true })

  } catch (e) {
    return handleApiError(e, 'POST /api/webhooks/polar')
  }
}

async function handleCheckoutCompleted(checkoutData: any) {
  const { customer_id, metadata, status } = checkoutData

  if (!customer_id || !metadata?.userId) {
    console.error('Missing customer_id or userId in checkout data')
    return
  }

  if (status !== 'completed') {
    console.log('Checkout not completed, ignoring')
    return
  }

  const tier = metadata.tier as 'pro' | 'premium'
  if (!tier) {
    console.error('No tier specified in checkout metadata')
    return
  }

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  try {
    await upsertUserSubscription(metadata.userId, {
      planType: tier,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
    })
    console.log(`Updated subscription for user ${metadata.userId} to ${tier} plan`)
  } catch (error) {
    console.error('Failed to update user subscription:', error)
    throw error
  }
}

async function handleSubscriptionCreated(subscriptionData: any) {
  console.log('Subscription created:', subscriptionData)
}

async function handleSubscriptionUpdated(subscriptionData: any) {
  console.log('Subscription updated:', subscriptionData)
}

async function handleSubscriptionDeleted(subscriptionData: any) {
  console.log('Subscription deleted:', subscriptionData)
}
