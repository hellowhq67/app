import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { sslCommerz } from '@/lib/billing/sslcommerz';
import {
    getTransactionBySSLCommerzTranId,
    updateSSLCommerzTransactionStatus,
} from '@/lib/db/queries/billing';
import {
    activateSubscription,
    createInvoiceForSSLCommerz,
    extractSSLCommerzMetadata,
    isSuccessfulTransaction,
} from '@/lib/billing/sslcommerz-helpers';

export async function POST(request: NextRequest) {
    try {
        // 1. Parse form data from SSL Commerz
        const formData = await request.formData();
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        console.log('SSL Commerz success callback received:', data.tran_id);

        const { tran_id, val_id, amount, status, currency } = data;

        // 2. Validate required fields
        if (!tran_id || !val_id) {
            console.error('Missing required fields in success callback');
            return redirect('/checkout/cancel?reason=invalid_callback');
        }

        // 3. Validate transaction with SSL Commerz API
        const isValid = await sslCommerz.validateTransaction(tran_id);
        if (!isValid) {
            console.error('Transaction validation failed:', tran_id);
            return redirect('/checkout/cancel?reason=validation_failed');
        }

        // 4. Get transaction from database
        const transaction = await getTransactionBySSLCommerzTranId(tran_id);
        if (!transaction) {
            console.error('Transaction not found in database:', tran_id);
            return redirect('/checkout/cancel?reason=transaction_not_found');
        }

        // 5. Check if already processed (idempotency)
        if (transaction.status === 'completed') {
            console.log('Transaction already processed, redirecting to success:', tran_id);
            return redirect(`/checkout/success?provider=sslcommerz&tran_id=${tran_id}`);
        }

        // 6. Process successful payment
        if (isSuccessfulTransaction(status)) {
            // Extract metadata
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
                callbackData: data,
            });

            console.log(`Payment successful and processed: ${tran_id}`);

            // Redirect to success page
            return redirect(`/checkout/success?provider=sslcommerz&tran_id=${tran_id}`);
        } else {
            // Payment not successful
            console.error('Payment status not successful:', status);
            await updateSSLCommerzTransactionStatus(tran_id, 'failed', {
                ...transaction.metadata,
                status,
                callbackData: data,
            });

            return redirect(`/checkout/cancel?reason=payment_not_successful&tran_id=${tran_id}`);
        }
    } catch (error) {
        console.error('SSL Commerz success callback error:', error);
        return redirect('/checkout/cancel?reason=processing_error');
    }
}
