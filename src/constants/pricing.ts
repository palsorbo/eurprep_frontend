// Pricing constants for the application
export const PRICING = {
    // SBI PO Premium Bundle pricing
    SBI_PO_PREMIUM_BUNDLE: {
        AMOUNT: 1, // Amount in rupees
        CURRENCY: 'INR',
        DESCRIPTION: 'SBI PO Premium Bundle',
        TYPE: 'one-time' as const
    }
} as const

// Helper function to get amount in paise for Razorpay
export const getAmountInPaise = (amountInRupees: number): number => {
    return amountInRupees * 100
}
