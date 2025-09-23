import { useState, useEffect } from 'react'
import { usePayment } from '../lib/payment-context'
import { X } from 'lucide-react'
import { getAmountInPaise, getProductByType } from '../constants/pricing'
import { loadRazorpayScript } from '../utils/loadScript'

declare global {
    interface Window {
        Razorpay: any
    }
}

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    productType: string
}

export default function PaymentModal({ isOpen, onClose, onSuccess, productType }: PaymentModalProps) {
    const { initializePayment, verifyPayment } = usePayment()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
    const [isLoadingScript, setIsLoadingScript] = useState(false)

    const product = getProductByType(productType)

    if (!product) {
        throw new Error(`Product type '${productType}' not found`)
    }

    // Load Razorpay script when modal opens
    useEffect(() => {
        if (isOpen && !isRazorpayLoaded && !isLoadingScript) {
            setIsLoadingScript(true)
            loadRazorpayScript()
                .then(() => {
                    setIsRazorpayLoaded(true)
                })
                .catch((error) => {
                    setError('Failed to load payment system. Please refresh and try again.')
                })
                .finally(() => {
                    setIsLoadingScript(false)
                })
        }
    }, [isOpen, isRazorpayLoaded, isLoadingScript])

    const handlePayment = async () => {
        if (!isRazorpayLoaded) {
            setError('Payment system is still loading. Please wait a moment and try again.')
            return
        }

        try {
            setIsProcessing(true)
            setError(null)

            const orderId = await initializePayment(
                product.AMOUNT,
                product.PRODUCT_TYPE
            )

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Only public key needed in frontend
                amount: getAmountInPaise(product.AMOUNT), // Amount in paise
                currency: product.CURRENCY,
                name: "EurPrep",
                description: product.DESCRIPTION,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        const success = await verifyPayment(
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature
                        )
                        if (success) {
                            onSuccess()
                            onClose()
                        } else {
                            setError("Payment verification failed. Please contact support.")
                        }
                    } catch (error) {
                        setError("Payment verification failed. Please try again.")
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: ""
                },
                theme: {
                    color: "#16a34a"
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            setError("Failed to initialize payment. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Unlock Premium Access
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">
                            Premium Bundle Includes:
                        </h3>
                        <ul className="text-green-700 space-y-2">
                            <li>✓ Access to Set 2 & 3</li>
                            <li>✓ All future question sets & free updates</li>
                            <li>✓ Advanced interview questions</li>
                            <li>✓ Expert-level scenarios</li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 mb-1">
                            ₹{product.AMOUNT}
                        </div>
                        <div className="text-slate-600 text-sm">
                            {product.TYPE} payment
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || isLoadingScript || !isRazorpayLoaded}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingScript ? "Loading Payment System..." : isProcessing ? "Processing..." : "Pay Now"}
                    </button>

                    <div className="text-center text-slate-500 text-sm">
                        Secure payment powered by Razorpay
                    </div>
                </div>
            </div>
        </div>
    )
}
