/**
 * Subscription Management Business Logic
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    subscriptions,
    type Subscription,
    type NewSubscription,
} from '@/lib/db/schema/billing';
import { users } from '@/lib/db/schema/users';
import {
    getActiveSubscription,
    getSubscriptionById,
    getSubscriptionByPolarId,
    getUserSubscriptions,
} from '@/lib/db/queries/billing';
import { SubscriptionTier } from '@/lib/subscription/tiers';

/**
 * Get current active subscription for a user
 */
export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
    return getActiveSubscription(userId);
}

/**
 * Create a new subscription record
 */
export async function createSubscription(
    userId: string,
    data: {
        polarSubscriptionId?: string;
        stripeSubscriptionId?: string;
        tier: string;
        amount: string;
        currency?: string;
        interval?: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        metadata?: any;
    }
): Promise<Subscription> {
    const [subscription] = await db
        .insert(subscriptions)
        .values({
            userId,
            polarSubscriptionId: data.polarSubscriptionId,
            stripeSubscriptionId: data.stripeSubscriptionId,
            tier: data.tier,
            status: 'active',
            amount: data.amount,
            currency: data.currency || 'USD',
            interval: data.interval || 'month',
            currentPeriodStart: data.currentPeriodStart,
            currentPeriodEnd: data.currentPeriodEnd,
            cancelAtPeriodEnd: false,
            metadata: data.metadata,
        })
        .returning();

    // Update user's subscription tier
    await db
        .update(users)
        .set({
            subscriptionTier: data.tier as any,
            subscriptionStatus: 'active',
            subscriptionExpiresAt: data.currentPeriodEnd,
        })
        .where(eq(users.id, userId));

    return subscription;
}

/**
 * Update subscription (upgrade/downgrade)
 */
export async function updateSubscription(
    subscriptionId: string,
    updates: {
        tier?: string;
        status?: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';
        amount?: string;
        currentPeriodStart?: Date;
        currentPeriodEnd?: Date;
        cancelAtPeriodEnd?: boolean;
        canceledAt?: Date;
        metadata?: any;
    }
): Promise<Subscription> {
    const [updated] = await db
        .update(subscriptions)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

    // Update user's subscription tier if tier changed
    if (updates.tier) {
        await db
            .update(users)
            .set({
                subscriptionTier: updates.tier as any,
                subscriptionStatus: (updates.status as any) || 'active',
                subscriptionExpiresAt: updates.currentPeriodEnd,
            })
            .where(eq(users.id, updated.userId));
    }

    return updated;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
): Promise<Subscription> {
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }

    const updates: any = {
        cancelAtPeriodEnd: !immediate,
        canceledAt: new Date(),
    };

    if (immediate) {
        updates.status = 'cancelled';

        // Update user's subscription status immediately
        await db
            .update(users)
            .set({
                subscriptionStatus: 'cancelled',
                subscriptionTier: 'free',
            })
            .where(eq(users.id, subscription.userId));
    }

    return updateSubscription(subscriptionId, updates);
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }

    if (subscription.status !== 'cancelled' && !subscription.cancelAtPeriodEnd) {
        throw new Error('Subscription is not cancelled');
    }

    const updates: any = {
        cancelAtPeriodEnd: false,
        canceledAt: null,
    };

    // If already cancelled, reactivate
    if (subscription.status === 'cancelled') {
        updates.status = 'active';

        await db
            .update(users)
            .set({
                subscriptionStatus: 'active',
                subscriptionTier: subscription.tier as any,
            })
            .where(eq(users.id, subscription.userId));
    }

    return updateSubscription(subscriptionId, updates);
}

/**
 * Sync subscription from Polar
 */
export async function syncSubscriptionFromPolar(
    polarSubscriptionId: string,
    polarData: {
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd?: boolean;
    }
): Promise<Subscription> {
    const subscription = await getSubscriptionByPolarId(polarSubscriptionId);
    if (!subscription) {
        throw new Error('Subscription not found');
    }

    const statusMap: Record<string, any> = {
        active: 'active',
        canceled: 'cancelled',
        past_due: 'past_due',
        unpaid: 'unpaid',
        trialing: 'trialing',
    };

    return updateSubscription(subscription.id, {
        status: statusMap[polarData.status] || 'active',
        currentPeriodStart: polarData.currentPeriodStart,
        currentPeriodEnd: polarData.currentPeriodEnd,
        cancelAtPeriodEnd: polarData.cancelAtPeriodEnd || false,
    });
}

/**
 * Check if subscription is active and not cancelled
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
    const subscription = await getActiveSubscription(userId);
    if (!subscription) return false;

    const now = new Date();
    return (
        subscription.status === 'active' &&
        subscription.currentPeriodEnd > now &&
        !subscription.cancelAtPeriodEnd
    );
}

/**
 * Get subscription tier for a user
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await getActiveSubscription(userId);
    if (!subscription) return SubscriptionTier.FREE;

    const tierMap: Record<string, SubscriptionTier> = {
        free: SubscriptionTier.FREE,
        pro: SubscriptionTier.PRO,
        premium: SubscriptionTier.PREMIUM,
    };

    return tierMap[subscription.tier] || SubscriptionTier.FREE;
}

/**
 * Get subscription history for a user
 */
export async function getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    return getUserSubscriptions(userId);
}
