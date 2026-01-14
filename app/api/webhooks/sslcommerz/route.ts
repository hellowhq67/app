import { NextRequest, NextResponse } from 'next/server';
import { sslCommerz } from '@/lib/billing/sslcommerz';
import {
    getTransactionBySSLCommerzTranId,
    updateSSLCommerzTransactionStatus,
} from '@/lib/db/queries/billing';
import {
    verifyIPNSignature,
    activateSubscription,
    createInvoiceForSSLCommerz,
    isSuccessfulTransaction,
    isFailedTransaction,
    isCancelledTransaction,
} from '@/lib/billing/sslcommerz-helpers';

/**
 * SSL Commerz IPN (Instant Payment Notification) Webhook Handler
 * This handles asynchronous payment status updates from SSL Commerz
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Parse form data from SSL Commerz IPN
        const formData = await request.formData();
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        console.log('SSL Commerz IPN received:', data.tran_id, 'Status:', data.status);

        const { tran_id, status, val_id, amount, currency } = data;

        // 2. Validate required fields
        if (!tran_id || !status || !val_id) {
            console.error('Missing required IPN fields');
            return NextResponse.json({ error: 'Invalid IPN data' }, { status: 400 });
        }

        // 3. Verify IPN signature
        const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
        if (!storePassword) {
            console.error('SSL Commerz store password not configured');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const isValidSignature = verifyIPNSignature(data, storePassword);
        if (!isValidSignature) {
            console.error('Invalid IPN signature for transaction:', tran_id);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 4. Validate transaction with SSL Commerz API
        const isTransactionValid = await sslCommerz.validateTransaction(tran_id);
        if (!isTransactionValid) {
            console.error('Transaction validation failed:', tran_id);
            return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
        }

        // 5. Get transaction from database
        const transaction = await getTransactionBySSLCommerzTranId(tran_id);
        if (!transaction) {
            console.error('Transaction not found in database:', tran_id);
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // 6. Check if already processed (idempotency)
        if (transaction.status === 'completed') {
            console.log('Transaction already processed, IPN acknowledged:', tran_id);
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // 7. Handle different transaction statuses
        if (isSuccessfulTransaction(status)) {
            console.log(`Processing successful payment from IPN: ${tran_id}`);

            try {
                // Extract tier from transaction metadata
                const { tier } = transaction.metadata as { tier: string };

                // Activate subscription
                await activateSubscription(transaction, data);

                // Create invoice
                await createInvoiceForSSLCommerz(
                    transaction.userId,
                    tran_id,
                    amount,
                    currency,
                    tier
                );

                // Update transaction status
                await updateSSLCommerzTransactionStatus(tran_id, 'completed', {
                    ...transaction.metadata,
                    ipnData: data,
                    processedAt: new Date().toISOString(),
                });

                console.log(`IPN processed successfully: ${tran_id}`);
            } catch (error) {
                console.error('Error processing successful IPN:', error);
                // Still return success to SSL Commerz to avoid retries
                // Log the error for manual investigation
                return NextResponse.json({
                    success: false,
                    error: 'Processing error, logged for investigation',
                });
            }
        } else if (isFailedTransaction(status)) {
            console.log(`Processing failed payment from IPN: ${tran_id}`);

            await updateSSLCommerzTransactionStatus(tran_id, 'failed', {
                ...transaction.metadata,
                ipnData: data,
                error: data.error || 'Payment failed',
                processedAt: new Date().toISOString(),
            });
        } else if (isCancelledTransaction(status)) {
            console.log(`Processing cancelled payment from IPN: ${tran_id}`);

            await updateSSLCommerzTransactionStatus(tran_id, 'cancelled', {
                ...transaction.metadata,
                ipnData: data,
                processedAt: new Date().toISOString(),
            });
        } else {
            console.log(`Unknown status from IPN: ${status} for ${tran_id}`);
            // Log but acknowledge the IPN
        }

        // 8. Return success response to SSL Commerz
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('SSL Commerz IPN processing error:', error);
        // Return 200 to prevent SSL Commerz from retrying
        // Log the error for manual investigation
        return NextResponse.json(
            { success: false, error: 'Internal error, logged for investigation' },
            { status: 200 }
        );
    }
}
