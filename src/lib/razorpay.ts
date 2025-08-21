// import { getCreditPackById } from './config/credit-packs'
// import { useCredits } from '../hooks/useCredits'
import { API_CONFIG } from './config'

declare global {
    interface Window {
        Razorpay: any
    }
}

export interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: any) => void
    prefill: {
        name?: string
        email?: string
        contact?: string
    }
    notes: Record<string, string>
    theme: {
        color: string
    }
    modal: {
        ondismiss: () => void
    }
}

export interface PaymentResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

export interface CreateOrderResponse {
    success: boolean
    data?: {
        order_id: string
        amount: number
        currency: string
        receipt: string
        pack: {
            id: string
            name: string
            price: number
            credits: number
            bonus: number
            total: number
            description: string
        }
        key_id: string
    }
    error?: string
}

export interface PaymentStatusResponse {
    success: boolean
    data?: {
        payment_id: string
        order_id: string
        payment_status: string
        amount: number
        currency: string
        pack_id: string
        user_id: string
        captured_at: number
        credits_added?: number
        new_balance?: number
    }
    error?: string
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Razorpay script'))
        document.head.appendChild(script)
    })
}

/**
 * Create a Razorpay order for credit pack purchase
 */
export async function createRazorpayOrder(packId: string): Promise<CreateOrderResponse> {
    try {
        // Call FlyIO backend to create order
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RAZORPAY_CREATE_ORDER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({
                packId: packId
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.error || `Failed to create order: ${response.status}`
            }
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        return { success: false, error: 'Failed to create order' }
    }
}

/**
 * Get JWT token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    try {
        const { supabase } = await import('./supabase')
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token || null
    } catch (error) {
        console.error('Error getting auth token:', error)
        return null
    }
}

/**
 * Verify payment status with backend
 */
export async function verifyPaymentStatus(
    orderId: string,
    paymentId: string,
    signature: string
): Promise<PaymentStatusResponse> {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RAZORPAY_PAYMENT_STATUS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify({
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.error || `Payment verification failed: ${response.status}`
            }
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error verifying payment:', error)
        return { success: false, error: 'Failed to verify payment' }
    }
}

/**
 * Get payment details from backend
 */
export async function getPaymentDetails(paymentId: string): Promise<any> {
    try {
        const token = await getAuthToken()
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RAZORPAY_PAYMENT_DETAILS}/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
        return await response.json()
    } catch (error) {
        console.error('Error getting payment details:', error)
        return { success: false, error: 'Failed to get payment details' }
    }
}

/**
 * Initialize Razorpay payment with proper error handling and success flow
 */
export async function initializePayment(
    packId: string,
    userId: string,
    userEmail: string,
    userName: string,
    onSuccess?: (pack: any) => void,
    onError?: (error: string) => void
): Promise<boolean> {
    try {
        // Load Razorpay script
        await loadRazorpayScript()

        // Create order
        const orderResponse = await createRazorpayOrder(packId)
        if (!orderResponse.success || !orderResponse.data) {
            const error = orderResponse.error || 'Failed to create order'
            onError?.(error)
            return false
        }

        const { order_id, key_id, pack } = orderResponse.data

        // Configure Razorpay options
        const options: RazorpayOptions = {
            key: key_id, // Use key_id from backend response
            amount: pack.price * 100, // Amount in paise
            currency: 'INR',
            name: 'Courage App',
            description: `${pack.name} - ${pack.total} Credits`,
            order_id: order_id,
            prefill: {
                name: userName,
                email: userEmail,
            },
            notes: {
                pack_id: packId,
                user_id: userId,
                pack_name: pack.name,
                credits: pack.total.toString()
            },
            theme: {
                color: '#3B82F6'
            },
            modal: {
                ondismiss: () => {
                    console.log('Payment modal dismissed')
                }
            },
            handler: async (response: PaymentResponse) => {
                try {
                    console.log('Payment successful:', response)

                    // Verify payment with backend
                    const verificationResult = await verifyPaymentStatus(
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    )

                    if (verificationResult.success && verificationResult.data) {
                        console.log('Payment verified successfully:', verificationResult.data)

                        // Check if credits were added immediately
                        if (verificationResult.data.credits_added) {
                            console.log(`✅ Credits added immediately: ${verificationResult.data.credits_added}`)
                            // Show immediate success with credits
                            onSuccess?.({
                                ...pack,
                                credits_added: verificationResult.data.credits_added,
                                new_balance: verificationResult.data.new_balance
                            })
                        } else {
                            console.log('⚠️ Credits not added immediately, will be added via webhook')
                            // Show success but mention credits will be added shortly
                            onSuccess?.({
                                ...pack,
                                credits_added: 0,
                                message: 'Payment successful! Credits will be added to your account shortly.'
                            })
                        }

                        // Refresh credit balance after a short delay
                        setTimeout(() => {
                            window.location.reload()
                        }, 2000)
                    } else {
                        console.error('Payment verification failed:', verificationResult.error)
                        onError?.('Payment verification failed. Please contact support.')
                    }

                } catch (error) {
                    console.error('Payment verification error:', error)
                    onError?.('Payment verification failed. Please contact support.')
                }
            }
        }

        // Initialize Razorpay
        console.log('Initializing Razorpay with options:', {
            key: options.key,
            amount: options.amount,
            currency: options.currency,
            order_id: options.order_id
        })

        const razorpay = new window.Razorpay(options)

        // Add comprehensive error handling
        razorpay.on('payment.failed', (response: any) => {
            console.error('Payment failed:', response)
            const errorMessage = response.error?.description ||
                response.error?.reason ||
                'Payment failed. Please try again.'
            onError?.(errorMessage)
        })

        razorpay.on('payment.cancelled', () => {
            console.log('Payment cancelled by user')
            onError?.('Payment was cancelled')
        })

        razorpay.on('payment.error', (response: any) => {
            console.error('Payment error:', response)
            onError?.('Payment error occurred. Please try again.')
        })

        razorpay.on('modal.close', () => {
            console.log('Modal closed')
        })

        // Open the payment modal
        razorpay.open()

        return true
    } catch (error) {
        console.error('Error initializing payment:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment'
        onError?.(errorMessage)
        return false
    }
}

/**
 * Verify payment signature (for backend use)
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

/**
 * Check if Razorpay is available
 */
export function isRazorpayAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Razorpay
} 