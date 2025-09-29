// Pricing constants for the application
export const PRICING = {
    // SBI PO Premium Bundle pricing
    SBI_PO_PREMIUM_BUNDLE: {
        AMOUNT: 1, // Amount in rupees
        CURRENCY: 'INR',
        DESCRIPTION: 'SBI PO Premium Bundle',
        TYPE: 'one-time' as const,
        PRODUCT_TYPE: 'sbi_po_premium_bundle' as const
    },
    // IBPS PO Premium Bundle pricing
    IBPS_PO_PREMIUM_BUNDLE: {
        AMOUNT: 2, // Amount in rupees
        CURRENCY: 'INR',
        DESCRIPTION: 'IBPS PO Premium Bundle',
        TYPE: 'one-time' as const,
        PRODUCT_TYPE: 'ibps_po_premium_bundle' as const
    },
    // Future products can be added here
    RRB_PO_BUNDLE: {
        AMOUNT: 3, // Amount in rupees
        CURRENCY: 'INR',
        DESCRIPTION: 'RRB PO Bundle',
        TYPE: 'one-time' as const,
        PRODUCT_TYPE: 'rrb_po_bundle' as const
    }
} as const

// Helper function to get product by type
export const getProductByType = (productType: string) => {
    return Object.values(PRICING).find(product => product.PRODUCT_TYPE === productType);
}

// Helper function to get product metadata for a purchase
export const getProductMetadata = (productType: string, additionalData?: Record<string, unknown>) => {
    const product = getProductByType(productType);
    if (!product) return null;

    return {
        product_name: product.DESCRIPTION, // Using DESCRIPTION as product name
        product_description: product.DESCRIPTION,
        purchase_timestamp: new Date().toISOString(),
        version: '1.0',
        ...additionalData
    };
}

// Helper function to get amount in paise for Razorpay
export const getAmountInPaise = (amountInRupees: number): number => {
    return amountInRupees * 100
}
