import { relations } from 'drizzle-orm';
import {
    boolean,
    decimal,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Enums
export const billingSubscriptionStatusEnum = pgEnum('billing_subscription_status', [
    'active',
    'cancelled',
    'past_due',
    'unpaid',
    'trialing',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
    'draft',
    'open',
    'paid',
    'void',
    'uncollectible',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
    'subscription',
    'credit_purchase',
    'refund',
    'adjustment',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
    'pending',
    'completed',
    'failed',
    'refunded',
]);

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    // External provider IDs
    polarSubscriptionId: text('polar_subscription_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),

    // Subscription details
    tier: text('tier').notNull(), // 'free', 'pro', 'premium'
    status: billingSubscriptionStatusEnum('status').notNull().default('active'),

    // Billing cycle
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    canceledAt: timestamp('canceled_at'),

    // Pricing
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('USD'),
    interval: text('interval').notNull().default('month'), // 'month', 'year'

    // External provider IDs
    sslCommerzTranId: text('sslcommerz_tran_id').unique(),
    sslCommerzSessionId: text('sslcommerz_session_id').unique(),

    // Metadata
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    polarIdIdx: index('subscriptions_polar_id_idx').on(table.polarSubscriptionId),
    statusIdx: index('subscriptions_status_idx').on(table.status),
}));

// Payment methods table
export const paymentMethods = pgTable('payment_methods', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    // External provider IDs
    polarPaymentMethodId: text('polar_payment_method_id').unique(),
    stripePaymentMethodId: text('stripe_payment_method_id').unique(),

    // Card details
    type: text('type').notNull().default('card'), // 'card', 'bank_account', etc.
    brand: text('brand'), // 'visa', 'mastercard', etc.
    last4: text('last4'),
    expiryMonth: integer('expiry_month'),
    expiryYear: integer('expiry_year'),

    // Settings
    isDefault: boolean('is_default').notNull().default(false),

    // Metadata
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    userIdIdx: index('payment_methods_user_id_idx').on(table.userId),
    defaultIdx: index('payment_methods_default_idx').on(table.userId, table.isDefault),
}));

// Invoices table
export const invoices = pgTable('invoices', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),

    // External provider IDs
    polarInvoiceId: text('polar_invoice_id').unique(),
    stripeInvoiceId: text('stripe_invoice_id').unique(),
    sslCommerzTranId: text('sslcommerz_tran_id').unique(),

    // Invoice details
    invoiceNumber: text('invoice_number').unique(),
    status: invoiceStatusEnum('status').notNull().default('open'),

    // Amounts
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).notNull().default('0'),
    amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('USD'),

    // Line items
    lineItems: jsonb('line_items').notNull(), // Array of {description, amount, quantity}

    // Dates
    invoiceDate: timestamp('invoice_date').notNull(),
    dueDate: timestamp('due_date'),
    paidAt: timestamp('paid_at'),

    // PDF
    pdfUrl: text('pdf_url'),

    // Metadata
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    userIdIdx: index('invoices_user_id_idx').on(table.userId),
    subscriptionIdIdx: index('invoices_subscription_id_idx').on(table.subscriptionId),
    statusIdx: index('invoices_status_idx').on(table.status),
    invoiceDateIdx: index('invoices_invoice_date_idx').on(table.invoiceDate),
}));

// Transactions table
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),

    // Transaction details
    type: transactionTypeEnum('type').notNull(),
    status: transactionStatusEnum('status').notNull().default('pending'),

    // Amounts
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('USD'),

    // Description
    description: text('description').notNull(),

    // External provider IDs
    polarTransactionId: text('polar_transaction_id'),
    stripeTransactionId: text('stripe_transaction_id'),
    sslCommerzTranId: text('sslcommerz_tran_id'),

    // Metadata
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    typeIdx: index('transactions_type_idx').on(table.type),
    statusIdx: index('transactions_status_idx').on(table.status),
    createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
}));

// Credit purchases table
export const creditPurchases = pgTable('credit_purchases', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'set null' }),

    // Purchase details
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // Dollar amount paid
    creditsAdded: decimal('credits_added', { precision: 10, scale: 2 }).notNull(), // Credits received
    currency: text('currency').notNull().default('USD'),

    // External provider IDs
    polarCheckoutId: text('polar_checkout_id'),
    stripeCheckoutId: text('stripe_checkout_id'),
    sslCommerzTranId: text('sslcommerz_tran_id'),

    // Status
    status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed'

    // Metadata
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    userIdIdx: index('credit_purchases_user_id_idx').on(table.userId),
    statusIdx: index('credit_purchases_status_idx').on(table.status),
    createdAtIdx: index('credit_purchases_created_at_idx').on(table.createdAt),
}));

// Relations
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    invoices: many(invoices),
    transactions: many(transactions),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
    user: one(users, {
        fields: [paymentMethods.userId],
        references: [users.id],
    }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    user: one(users, {
        fields: [invoices.userId],
        references: [users.id],
    }),
    subscription: one(subscriptions, {
        fields: [invoices.subscriptionId],
        references: [subscriptions.id],
    }),
    transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    subscription: one(subscriptions, {
        fields: [transactions.subscriptionId],
        references: [subscriptions.id],
    }),
    invoice: one(invoices, {
        fields: [transactions.invoiceId],
        references: [invoices.id],
    }),
}));

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
    user: one(users, {
        fields: [creditPurchases.userId],
        references: [users.id],
    }),
    transaction: one(transactions, {
        fields: [creditPurchases.transactionId],
        references: [transactions.id],
    }),
}));

// Type exports
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type NewCreditPurchase = typeof creditPurchases.$inferInsert;
