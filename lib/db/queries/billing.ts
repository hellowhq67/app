/**
 * Database queries for billing operations
 */

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
    subscriptions,
    paymentMethods,
    invoices,
    transactions,
    creditPurchases,
    type Subscription,
    type PaymentMethod,
    type Invoice,
    type Transaction,
    type CreditPurchase,
} from '@/lib/db/schema/billing';

// ============================================================================
// Subscription Queries
// ============================================================================

/**
 * Get active subscription for a user
 */
export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
    const result = await db.query.subscriptions.findFirst({
        where: and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, 'active')
        ),
        orderBy: desc(subscriptions.createdAt),
    });

    return result || null;
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    const result = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, subscriptionId),
    });

    return result || null;
}

/**
 * Create or update user subscription
 */
export async function upsertUserSubscription(userId: string, subscriptionData: {
    polarProductId: string;
    polarSubscriptionId: string;
    status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
    tier?: string;
    amount?: number;
}): Promise<Subscription> {
    // Check if user has existing subscription
    const existingSubscription = await getActiveSubscription(userId);

    const subscriptionPayload = {
        userId,
        polarSubscriptionId: subscriptionData.polarSubscriptionId,
        status: subscriptionData.status,
        currentPeriodStart: subscriptionData.currentPeriodStart,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd ?? false,
        tier: subscriptionData.tier || 'pro',
        amount: subscriptionData.amount ? subscriptionData.amount.toString() : '29.99',
        currency: 'USD',
        interval: 'month',
    };

    if (existingSubscription) {
        // Update existing subscription
        const [updated] = await db
            .update(subscriptions)
            .set({
                ...subscriptionPayload,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSubscription.id))
            .returning();

        return updated;
    } else {
        // Create new subscription
        const [created] = await db
            .insert(subscriptions)
            .values(subscriptionPayload)
            .returning();

        return created;
    }
}

/**
 * Get subscription by Polar ID
 */
export async function getSubscriptionByPolarId(polarId: string): Promise<Subscription | null> {
    const result = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.polarSubscriptionId, polarId),
    });

    return result || null;
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return db.query.subscriptions.findMany({
        where: eq(subscriptions.userId, userId),
        orderBy: desc(subscriptions.createdAt),
    });
}

// ============================================================================
// Payment Method Queries
// ============================================================================

/**
 * Get all payment methods for a user
 */
export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return db.query.paymentMethods.findMany({
        where: eq(paymentMethods.userId, userId),
        orderBy: desc(paymentMethods.isDefault),
    });
}

/**
 * Get default payment method for a user
 */
export async function getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    const result = await db.query.paymentMethods.findFirst({
        where: and(
            eq(paymentMethods.userId, userId),
            eq(paymentMethods.isDefault, true)
        ),
    });

    return result || null;
}

/**
 * Get payment method by ID
 */
export async function getPaymentMethodById(methodId: string): Promise<PaymentMethod | null> {
    const result = await db.query.paymentMethods.findFirst({
        where: eq(paymentMethods.id, methodId),
    });

    return result || null;
}

// ============================================================================
// Invoice Queries
// ============================================================================

/**
 * Get invoices for a user with pagination
 */
export async function getUserInvoices(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        status?: string;
    } = {}
): Promise<{ invoices: Invoice[]; total: number }> {
    const { limit = 10, offset = 0, status } = options;

    const conditions = [eq(invoices.userId, userId)];
    if (status) {
        conditions.push(eq(invoices.status, status as any));
    }

    const [invoicesList, totalResult] = await Promise.all([
        db.query.invoices.findMany({
            where: and(...conditions),
            orderBy: desc(invoices.invoiceDate),
            limit,
            offset,
        }),
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(invoices)
            .where(and(...conditions)),
    ]);

    return {
        invoices: invoicesList,
        total: totalResult[0]?.count || 0,
    };
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    const result = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
    });

    return result || null;
}

/**
 * Get invoice by Polar ID
 */
export async function getInvoiceByPolarId(polarId: string): Promise<Invoice | null> {
    const result = await db.query.invoices.findFirst({
        where: eq(invoices.polarInvoiceId, polarId),
    });

    return result || null;
}

/**
 * Get invoices for a subscription
 */
export async function getSubscriptionInvoices(subscriptionId: string): Promise<Invoice[]> {
    return db.query.invoices.findMany({
        where: eq(invoices.subscriptionId, subscriptionId),
        orderBy: desc(invoices.invoiceDate),
    });
}

// ============================================================================
// Transaction Queries
// ============================================================================

/**
 * Get transactions for a user with pagination
 */
export async function getUserTransactions(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        type?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    } = {}
): Promise<{ transactions: Transaction[]; total: number }> {
    const { limit = 20, offset = 0, type, status, startDate, endDate } = options;

    const conditions = [eq(transactions.userId, userId)];
    if (type) {
        conditions.push(eq(transactions.type, type as any));
    }
    if (status) {
        conditions.push(eq(transactions.status, status as any));
    }
    if (startDate) {
        conditions.push(gte(transactions.createdAt, startDate));
    }
    if (endDate) {
        conditions.push(lte(transactions.createdAt, endDate));
    }

    const [transactionsList, totalResult] = await Promise.all([
        db.query.transactions.findMany({
            where: and(...conditions),
            orderBy: desc(transactions.createdAt),
            limit,
            offset,
        }),
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(transactions)
            .where(and(...conditions)),
    ]);

    return {
        transactions: transactionsList,
        total: totalResult[0]?.count || 0,
    };
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
    const result = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
    });

    return result || null;
}

// ============================================================================
// Credit Purchase Queries
// ============================================================================

/**
 * Get credit purchases for a user with pagination
 */
export async function getUserCreditPurchases(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        status?: string;
    } = {}
): Promise<{ purchases: CreditPurchase[]; total: number }> {
    const { limit = 10, offset = 0, status } = options;

    const conditions = [eq(creditPurchases.userId, userId)];
    if (status) {
        conditions.push(eq(creditPurchases.status, status));
    }

    const [purchasesList, totalResult] = await Promise.all([
        db.query.creditPurchases.findMany({
            where: and(...conditions),
            orderBy: desc(creditPurchases.createdAt),
            limit,
            offset,
        }),
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(creditPurchases)
            .where(and(...conditions)),
    ]);

    return {
        purchases: purchasesList,
        total: totalResult[0]?.count || 0,
    };
}

/**
 * Get credit purchase by ID
 */
export async function getCreditPurchaseById(purchaseId: string): Promise<CreditPurchase | null> {
    const result = await db.query.creditPurchases.findFirst({
        where: eq(creditPurchases.id, purchaseId),
    });

    return result || null;
}

/**
 * Get credit purchase by Polar checkout ID
 */
export async function getCreditPurchaseByPolarCheckoutId(checkoutId: string): Promise<CreditPurchase | null> {
    const result = await db.query.creditPurchases.findFirst({
        where: eq(creditPurchases.polarCheckoutId, checkoutId),
    });

    return result || null;
}

/**
 * Get total credits purchased by user
 */
export async function getTotalCreditsPurchased(userId: string): Promise<number> {
    const result = await db
        .select({
            total: sql<number>`COALESCE(SUM(${creditPurchases.creditsAdded}), 0)::numeric`,
        })
        .from(creditPurchases)
        .where(
            and(
                eq(creditPurchases.userId, userId),
                eq(creditPurchases.status, 'completed')
            )
        );

    return Number(result[0]?.total || 0);
}
