import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supabase'
// import type { Payment } from './supabase'

interface PaymentContextType {
    hasAccessToProduct: (productType: string) => boolean
    purchasedProducts: string[]
    isLoading: boolean
    refreshPaymentStatus: () => Promise<void>
    initializePayment: (amount: number, productType: string, productMetadata?: Record<string, unknown>) => Promise<string>
    verifyPayment: (paymentId: string, orderId: string, signature: string) => Promise<boolean>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [purchasedProducts, setPurchasedProducts] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refreshPaymentStatus = async () => {
        if (!user) {
            setPurchasedProducts([])
            setIsLoading(false)
            return
        }

        // Check if the user has paid for any products
        // (✅ Payment Status Check - Frontend is OK)
        try {
            const { data: payments, error } = await supabase
                .from('payments')
                .select('product_type')
                .eq('user_id', user.id)
                .eq('status', 'completed')

            if (error) throw error

            const productTypes = payments?.map(payment => payment.product_type) || []
            setPurchasedProducts(productTypes)
        } catch (error) {
            console.error('Error fetching payment status:', error)
            setPurchasedProducts([])
        } finally {
            setIsLoading(false)
        }
    }

    const hasAccessToProduct = (productType: string): boolean => {
        return purchasedProducts.includes(productType)
    }

    const initializePayment = async (amount: number, productType: string, productMetadata?: Record<string, unknown>): Promise<string> => {
        if (!user) throw new Error('User not authenticated')

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/v1/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, productType }),
            })

            if (!response.ok) throw new Error('Failed to create order')

            const { orderId } = await response.json()

            // Create payment record in Supabase
            // !TODO: Add payment record in backend not frontend
            const { error } = await supabase
                .from('payments')
                .insert({
                    user_id: user.id,
                    amount,
                    currency: 'INR',
                    product_type: productType,
                    product_metadata: productMetadata || null,
                    razorpay_order_id: orderId,
                    status: 'pending'
                })

            if (error) throw error
            return orderId
        } catch (error) {
            console.error('Error initializing payment:', error)
            throw error
        }
    }

    const verifyPayment = async (paymentId: string, orderId: string, signature: string): Promise<boolean> => {
        if (!user) throw new Error('User not authenticated')

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            console.log('Verifying payment:', { paymentId, orderId, signature });
            const response = await fetch(`${baseUrl}/api/v1/payments/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentId, orderId, signature }),
            })

            if (!response.ok) throw new Error('Payment verification failed')

            const { success } = await response.json()

            if (success) {
                // Update payment record in Supabase
                // !TODO: Update payment record in backend not frontend
                const { error } = await supabase
                    .from('payments')
                    .update({
                        status: 'completed',
                        razorpay_payment_id: paymentId
                    })
                    .eq('razorpay_order_id', orderId)

                if (error) throw error
                await refreshPaymentStatus()
            }

            return success
        } catch (error) {
            console.error('Error verifying payment:', error)
            throw error
        }
    }

    useEffect(() => {
        refreshPaymentStatus()
    }, [user])

    return (
        <PaymentContext.Provider value={{
            hasAccessToProduct,
            purchasedProducts,
            isLoading,
            refreshPaymentStatus,
            initializePayment,
            verifyPayment
        }}>
            {children}
        </PaymentContext.Provider>
    )
}

export function usePayment() {
    const context = useContext(PaymentContext)
    if (context === undefined) {
        throw new Error('usePayment must be used within a PaymentProvider')
    }
    return context
}
