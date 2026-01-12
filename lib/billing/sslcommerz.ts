/**
 * SSLCommerz Payment Gateway Integration
 */

export interface SSLCommerzConfig {
    storeId: string;
    storePassword: string;
    isSandbox: boolean;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
}

export interface SSLCommerzPaymentInit {
    totalAmount: number;
    currency: 'BDT' | 'USD';
    tranId: string;
    productName: string;
    productCategory: string;
    cusName: string;
    cusEmail: string;
    cusAdd1: string;
    cusCity: string;
    cusPostcode: string;
    cusCountry: string;
    cusPhone: string;
    shippingMethod: 'YES' | 'NO';
    type?: string; // 'subscription' | 'credits'
    userId: string;
    tier?: string;
}

export class SSLCommerzClient {
    private config: SSLCommerzConfig;
    private baseUrl: string;

    constructor(config: SSLCommerzConfig) {
        this.config = config;
        this.baseUrl = config.isSandbox
            ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
    }

    /**
     * Initialize a payment and get the redirect URL
     */
    async initPayment(data: SSLCommerzPaymentInit): Promise<{ GatewayPageURL?: string; status: string; failedreason?: string }> {
        const formData = new URLSearchParams();

        // Store Credentials
        formData.append('store_id', this.config.storeId);
        formData.append('store_passwd', this.config.storePassword);

        // Amount & Currency
        formData.append('total_amount', data.totalAmount.toString());
        formData.append('currency', data.currency);
        formData.append('tran_id', data.tranId);

        // Redirect URLs
        formData.append('success_url', this.config.successUrl);
        formData.append('fail_url', this.config.failUrl);
        formData.append('cancel_url', this.config.cancelUrl);
        formData.append('ipn_url', this.config.ipnUrl);

        // Customer Info
        formData.append('cus_name', data.cusName);
        formData.append('cus_email', data.cusEmail);
        formData.append('cus_add1', data.cusAdd1);
        formData.append('cus_city', data.cusCity);
        formData.append('cus_postcode', data.cusPostcode);
        formData.append('cus_country', data.cusCountry);
        formData.append('cus_phone', data.cusPhone);

        // Product Info
        formData.append('shipping_method', data.shippingMethod);
        formData.append('num_of_item', '1');
        formData.append('product_name', data.productName);
        formData.append('product_category', data.productCategory);
        formData.append('product_profile', 'general');

        // Custom Metadata (Value fields)
        formData.append('value_a', data.userId);
        formData.append('value_b', data.type || 'subscription');
        formData.append('value_c', data.tier || '');
        formData.append('value_d', 'pedagogists_pte');

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        return result;
    }

    /**
     * Validate a transaction after redirect
     */
    async validateTransaction(tranId: string): Promise<boolean> {
        const validationUrl = this.config.isSandbox
            ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
            : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

        const url = new URL(validationUrl);
        url.searchParams.append('tran_id', tranId);
        url.searchParams.append('store_id', this.config.storeId);
        url.searchParams.append('store_passwd', this.config.storePassword);

        const response = await fetch(url.toString());
        const result = await response.json();

        return result.status === 'VALID' || result.status === 'VALIDATED';
    }
}

/**
 * Singleton instance of SSLCommerz client
 */
export const sslCommerz = new SSLCommerzClient({
    storeId: process.env.SSLCOMMERZ_STORE_ID || '',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
    isSandbox: process.env.SSLCOMMERZ_IS_SANDBOX !== 'false',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/sslcommerz/success`,
    failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/sslcommerz/fail`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/sslcommerz/cancel`,
    ipnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/sslcommerz`,
});
