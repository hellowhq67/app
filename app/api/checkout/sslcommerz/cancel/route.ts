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

        console.log('SSL Commerz cancel callback received:', data.tran_id);

        const { tran_id } = data;

        // 2. Validate required fields
        if (!tran_id) {
            console.error('Missing transaction ID in cancel callback');
            return redirect('/checkout/cancel?reason=invalid_callback');
        }

        // 3. Update transaction status to cancelled
        await updateSSLCommerzTransactionStatus(tran_id, 'cancelled', {
            cancelCallbackData: data,
        });

        console.log(`Payment cancelled by user: ${tran_id}`);

        // 4. Redirect to cancel page
        return redirect(`/checkout/cancel?reason=user_cancelled&tran_id=${tran_id}`);
    } catch (error) {
        console.error('SSL Commerz cancel callback error:', error);
        return redirect('/checkout/cancel?reason=processing_error');
    }
}
