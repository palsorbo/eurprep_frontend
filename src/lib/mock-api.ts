// Mock API for development testing
// In production, these would be handled by your Fly.io backend

export async function mockCreateOrder(data: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Mock: Creating order for:', data)

    return {
        success: true,
        order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
}

export async function mockVerifyPayment(data: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Mock: Verifying payment:', data)

    return {
        success: true,
        message: 'Payment verified successfully'
    }
}

export async function mockPaymentStatus(paymentId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
        success: true,
        status: 'captured',
        payment_id: paymentId
    }
} 