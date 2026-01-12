/**
 * SSL Commerz Helper Functions
 * Utility functions for IPN verification, subscription activation, and invoice creation
 */

import crypto from 'crypto';
import { db } from '@/lib/db/drizzle';
import { subscriptions, invoices } from '@/lib/db/schema/billing';
import type { Transaction } from '@/lib/db/schema/billing';

/**
 * Verify IPN signature from SSL Commerz
 * Uses MD5 hash verification as per SSL Commerz documentation
 */
export function verifyIPNSignature(data: any, storePassword: string): boolean {
    try {
        const { verify_sign, val_id, tran_id, amount, currency, status } = data;

        if (!verify_sign || !val_id || !tran_id || !amount || !currency || !status) {
            console.error('Missing required IPN fields for signature verification');
            return false;
        }

        // SSL Commerz IPN signature format: MD5(store_passwd + val_id + tran_id + amount + currency + status)
        const expectedHash = crypto
            .createHash('md5')
            .update(storePassword + val_id + tran_id + amount + currency + status)
            .digest('hex');

        // Timing-safe comparison
        return crypto.timingSafeEqual(
            Buffer.from(verify_sign),
            Buffer.from(expectedHash)
        );
    } catch (error) {
        console.error('IPN signature verification error:', error);
        return false;
    }
}

/**
 * Activate subscription after successful SSL Commerz payment
 */
export async function activateSubscription(
    transaction: Transaction,
    ipnData: any
): Promise<void> {
    try {
        const { userId, metadata } = transaction;
        const tier = metadata?.tier || 'pro';

        // Calculate subscription period (1 month)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        // Create or update subscription
        await db
            .insert(subscriptions)
            .values({
                userId,
                tier,
                status: 'active',
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate,
                amount: transaction.amount,
                currency: transaction.currency,
                interval: 'month',
                sslCommerzTranId: ipnData.tran_id,
                cancelAtPeriodEnd: false,
            })
            .onConflictDoUpdate({
                target: subscriptions.userId,
                set: {
                    tier,
                    status: 'active',
                    currentPeriodStart: startDate,
                    currentPeriodEnd: endDate,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    sslCommerzTranId: ipnData.tran_id,
                    updatedAt: new Date(),
                },
            });

        console.log(`Subscription activated for user ${userId}, tier: ${tier}`);
    } catch (error) {
        console.error('Subscription activation error:', error);
        throw error;
    }
}

/**
 * Create invoice for SSL Commerz payment
 */
export async function createInvoiceForSSLCommerz(
    userId: string,
    tranId: string,
    amount: string,
    currency: string,
    tier: string
): Promise<void> {
    try {
        const invoiceNumber = `INV-SSL-${Date.now()}`;

        await db.insert(invoices).values({
            userId,
            sslCommerzTranId: tranId,
            invoiceNumber,
            status: 'paid',
            subtotal: amount,
            tax: '0',
            total: amount,
            amountPaid: amount,
            amountDue: '0',
            currency,
            lineItems: [
                {
                    description: `PTE ${tier.toUpperCase()} Subscription`,
                    amount: parseFloat(amount),
                    quantity: 1,
                },
            ],
            invoiceDate: new Date(),
            paidAt: new Date(),
        });

        console.log(`Invoice created: ${invoiceNumber} for transaction ${tranId}`);
    } catch (error) {
        console.error('Invoice creation error:', error);
        throw error;
    }
}

/**
 * Extract metadata from SSL Commerz response
 */
export function extractSSLCommerzMetadata(data: any): {
    userId: string;
    type: string;
    tier: string;
} {
    return {
        userId: data.value_a || '',
        type: data.value_b || 'subscription',
        tier: data.value_c || 'pro',
    };
}

/**
 * Check if transaction status is successful
 */
export function isSuccessfulTransaction(status: string): boolean {
    return status === 'VALID' || status === 'VALIDATED';
}

/**
 * Check if transaction status is failed
 */
export function isFailedTransaction(status: string): boolean {
    return status === 'FAILED';
}

/**
 * Check if transaction status is cancelled
 */
export function isCancelledTransaction(status: string): boolean {
    return status === 'CANCELLED';
}
