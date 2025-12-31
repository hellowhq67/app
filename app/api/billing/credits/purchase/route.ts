import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Polar } from '@polar-sh/sdk';
import {
    createCreditPurchase,
    calculateCreditsForAmount,
    CREDIT_PACKAGES,
} from '@/lib/billing/credits';

/**
 * POST /api/billing/credits/purchase
 * Create a checkout session for credit purchase
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount } = await request.json();

        if (!amount || amount < 10) {
            return NextResponse.json(
                { error: 'Minimum purchase amount is $10' },
                { status: 400 }
            );
        }

        const credits = calculateCreditsForAmount(amount);

        // Create credit purchase record
        const purchase = await createCreditPurchase(session.user.id, {
            amount,
            creditsAdded: credits,
            status: 'pending',
            metadata: {
                package: Object.entries(CREDIT_PACKAGES).find(
                    ([_, pkg]) => pkg.amount === amount
                )?.[0] || 'custom',
            },
        });

        // Create Polar checkout session for one-time payment
        const polar = new Polar({
            accessToken: process.env.POLAR_ACCESS_TOKEN!,
        });

        // Note: For one-time payments, you'd need a one-time product in Polar
        // This is a simplified example
        const checkout = await polar.checkouts.create({
            products: [], // Add your one-time product ID here
            amount: amount * 100, // Convert to cents
            successUrl: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/billing?purchase=success&id=${purchase.id}`,
            customerEmail: session.user.email,
            customerName: session.user.name || undefined,
            metadata: {
                purchaseId: purchase.id,
                credits: credits.toString(),
                userId: session.user.id,
            },
        });

        // Update purchase with checkout ID
        await createCreditPurchase(session.user.id, {
            amount,
            creditsAdded: credits,
            polarCheckoutId: checkout.id,
            status: 'pending',
        });

        return NextResponse.json({
            url: checkout.url,
            checkoutId: checkout.id,
            purchaseId: purchase.id,
            credits,
        });
    } catch (error) {
        console.error('Error creating credit purchase:', error);
        return NextResponse.json(
            { error: 'Failed to create credit purchase' },
            { status: 500 }
        );
    }
}
