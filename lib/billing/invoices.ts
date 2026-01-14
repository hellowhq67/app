/**
 * Invoice Management Business Logic
 */

import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import {
    invoices,
    type Invoice,
    type NewInvoice,
} from '@/lib/db/schema/billing';
import {
    getUserInvoices,
    getInvoiceById,
    getInvoiceByPolarId,
    getSubscriptionInvoices,
} from '@/lib/db/queries/billing';

/**
 * Create a new invoice record
 */
export async function createInvoice(
    userId: string,
    data: {
        subscriptionId?: string;
        polarInvoiceId?: string;
        stripeInvoiceId?: string;
        invoiceNumber: string;
        status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
        subtotal: string;
        tax?: string;
        total: string;
        amountPaid?: string;
        amountDue: string;
        currency?: string;
        lineItems: any[];
        invoiceDate: Date;
        dueDate?: Date;
        paidAt?: Date;
        pdfUrl?: string;
        metadata?: any;
    }
): Promise<Invoice> {
    const [invoice] = await db
        .insert(invoices)
        .values({
            userId,
            subscriptionId: data.subscriptionId,
            polarInvoiceId: data.polarInvoiceId,
            stripeInvoiceId: data.stripeInvoiceId,
            invoiceNumber: data.invoiceNumber,
            status: data.status || 'open',
            subtotal: data.subtotal,
            tax: data.tax || '0',
            total: data.total,
            amountPaid: data.amountPaid || '0',
            amountDue: data.amountDue,
            currency: data.currency || 'USD',
            lineItems: data.lineItems,
            invoiceDate: data.invoiceDate,
            dueDate: data.dueDate,
            paidAt: data.paidAt,
            pdfUrl: data.pdfUrl,
            metadata: data.metadata,
        })
        .returning();

    return invoice;
}

/**
 * Get invoices for a user with pagination
 */
export async function getInvoices(
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        status?: string;
    } = {}
): Promise<{ invoices: Invoice[]; total: number }> {
    return getUserInvoices(userId, options);
}

/**
 * Get a specific invoice
 */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
    return getInvoiceById(invoiceId);
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
    invoiceId: string,
    paidAt: Date = new Date()
): Promise<Invoice> {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
        throw new Error('Invoice not found');
    }

    const [updated] = await db
        .update(invoices)
        .set({
            status: 'paid',
            paidAt,
            amountPaid: invoice.total,
            amountDue: '0',
            updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId))
        .returning();

    return updated;
}

/**
 * Update invoice PDF URL
 */
export async function updateInvoicePdfUrl(
    invoiceId: string,
    pdfUrl: string
): Promise<Invoice> {
    const [updated] = await db
        .update(invoices)
        .set({
            pdfUrl,
            updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId))
        .returning();

    return updated;
}

/**
 * Generate invoice PDF (placeholder - would integrate with PDF generation service)
 */
export async function generateInvoicePDF(invoiceId: string): Promise<string> {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
        throw new Error('Invoice not found');
    }

    // If PDF URL already exists, return it
    if (invoice.pdfUrl) {
        return invoice.pdfUrl;
    }

    // TODO: Implement PDF generation
    // For now, return Polar PDF URL if available
    if (invoice.polarInvoiceId) {
        // Polar provides PDF URLs in their invoice objects
        return `https://polar.sh/invoices/${invoice.polarInvoiceId}/pdf`;
    }

    throw new Error('PDF generation not implemented');
}

/**
 * Sync invoice from Polar
 */
export async function syncInvoiceFromPolar(
    polarInvoiceId: string,
    polarData: {
        status: string;
        amountPaid?: string;
        paidAt?: Date;
        pdfUrl?: string;
    }
): Promise<Invoice> {
    const invoice = await getInvoiceByPolarId(polarInvoiceId);
    if (!invoice) {
        throw new Error('Invoice not found');
    }

    const statusMap: Record<string, any> = {
        draft: 'draft',
        open: 'open',
        paid: 'paid',
        void: 'void',
        uncollectible: 'uncollectible',
    };

    const updates: any = {
        status: statusMap[polarData.status] || 'open',
        updatedAt: new Date(),
    };

    if (polarData.amountPaid) {
        updates.amountPaid = polarData.amountPaid;
    }

    if (polarData.paidAt) {
        updates.paidAt = polarData.paidAt;
    }

    if (polarData.pdfUrl) {
        updates.pdfUrl = polarData.pdfUrl;
    }

    const [updated] = await db
        .update(invoices)
        .set(updates)
        .where(eq(invoices.id, invoice.id))
        .returning();

    return updated;
}
