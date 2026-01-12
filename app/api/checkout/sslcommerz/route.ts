import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sslCommerz } from '@/lib/billing/sslcommerz';
import { TIER_PRICING, SubscriptionTier } from '@/lib/subscription/tiers';
import { createSSLCommerzTransaction } from '@/lib/db/queries/billing';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse request
        const { tier, currency } = await request.json();
        if (!['pro', 'premium'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        if (currency !== 'BDT') {
            return NextResponse.json(
                { error: 'SSL Commerz only supports BDT currency' },
                { status: 400 }
            );
        }

        // 3. Get pricing
        const tierKey = tier as SubscriptionTier;
        const pricing = TIER_PRICING[tierKey];
        const amount = pricing.bdtPrice;

        if (!amount || amount === 0) {
            return NextResponse.json(
                { error: 'Invalid pricing for tier' },
                { status: 400 }
            );
        }

        // 4. Generate unique transaction ID
        const tranId = `PTE-${nanoid(12)}-${Date.now()}`;

        // 5. Create pending transaction in database
        await createSSLCommerzTransaction({
            userId: session.user.id,
            tier,
            amount,
            currency: 'BDT',
            tranId,
            type: 'subscription',
        });

        // 6. Initialize payment with SSL Commerz
        const result = await sslCommerz.initPayment({
            totalAmount: amount,
            currency: 'BDT',
            tranId,
            productName: `PTE ${tier.toUpperCase()} Subscription`,
            productCategory: 'subscription',
            cusName: session.user.name || 'PTE User',
            cusEmail: session.user.email,
            cusAdd1: 'Bangladesh',
            cusCity: 'Dhaka',
            cusPostcode: '1000',
            cusCountry: 'Bangladesh',
            cusPhone: '01700000000', // TODO: Get from user profile when available
            shippingMethod: 'NO',
            type: 'subscription',
            userId: session.user.id,
            tier,
        });

        // 7. Check if payment initialization was successful
        if (result.status !== 'SUCCESS' || !result.GatewayPageURL) {
            console.error('SSL Commerz payment init failed:', result);
            throw new Error(result.failedreason || 'Payment initialization failed');
        }

        console.log(`SSL Commerz checkout created: ${tranId} for user ${session.user.id}`);

        // 8. Return redirect URL
        return NextResponse.json({
            url: result.GatewayPageURL,
            tranId,
        });
    } catch (error) {
        console.error('SSL Commerz checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize payment' },
            { status: 500 }
        );
    }
}
