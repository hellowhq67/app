import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { updateSSLCommerzTransactionStatus } from '@/lib/db/queries/billing';

export async function POST(request: NextRequest) {
    try {
        // 1. Parse form data from SSL Commerz
        const formData = await request.formData();
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        console.log('SSL Commerz fail callback received:', data.tran_id);

        const { tran_id, error } = data;

        // 2. Validate required fields
        if (!tran_id) {
            console.error('Missing transaction ID in fail callback');
            return redirect('/checkout/cancel?reason=invalid_callback');
        }

        // 3. Update transaction status to failed
        await updateSSLCommerzTransactionStatus(tran_id, 'failed', {
            error: error || 'Payment failed',
            failCallbackData: data,
        });

        console.log(`Payment failed: ${tran_id}, reason: ${error || 'Unknown'}`);

        // 4. Redirect to cancel page
        return redirect(`/checkout/cancel?reason=payment_failed&tran_id=${tran_id}`);
    } catch (error) {
        console.error('SSL Commerz fail callback error:', error);
        return redirect('/checkout/cancel?reason=processing_error');
    }
}
