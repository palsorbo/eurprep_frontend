import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import { useCredits } from '../hooks/useCredits'
import { useAuth } from '../lib/auth-context'
import { initializePayment } from '../lib/razorpay'
import PaymentSuccess from '../components/PaymentSuccess'
import { CreditPacksDisplay } from '../components/CreditPacksDisplay'
import type { CreditPack } from '../lib/types/api'

export default function BuyCredits() {
    const { balance, refreshBalance } = useCredits()
    const { user } = useAuth()
    const [processingPack, setProcessingPack] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successData, setSuccessData] = useState({
        creditsAdded: 0,
        packName: '',
        newBalance: 0,
        message: ''
    })
    const [paymentError, setPaymentError] = useState<string | null>(null)

    const handlePurchase = async (pack: CreditPack) => {
        if (!user?.id) {
            setPaymentError('Please log in to purchase credits.')
            return
        }

        setProcessingPack(pack.id)
        setPaymentError(null)

        try {
            const success = await initializePayment(
                pack.id,
                user.id,
                user.email || '',
                user.user_metadata?.full_name || 'User',
                // Success callback
                (successPack) => {
                    setSuccessData({
                        creditsAdded: successPack.credits_added || successPack.total,
                        packName: successPack.name,
                        newBalance: successPack.new_balance || 0,
                        message: successPack.message || ''
                    })
                    setShowSuccess(true)
                    setProcessingPack(null)

                    // Refresh credit balance
                    setTimeout(() => {
                        refreshBalance()
                    }, 1000)
                },
                // Error callback
                (errorMessage) => {
                    setPaymentError(errorMessage)
                    setProcessingPack(null)
                }
            )

            if (!success) {
                setPaymentError('Failed to initialize payment. Please try again.')
                setProcessingPack(null)
            }
        } catch (error) {
            console.error('Payment error:', error)
            setPaymentError('Payment failed. Please try again.')
            setProcessingPack(null)
        }
    }

    const handlePackSelect = (pack: CreditPack) => {
        handlePurchase(pack)
    }

    const handleCloseSuccess = () => {
        setShowSuccess(false)
        setSuccessData({
            creditsAdded: 0,
            packName: '',
            newBalance: 0,
            message: ''
        })
    }

    const handleDismissError = () => {
        setPaymentError(null)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AuthenticatedHeader
                pageTitle="Buy Credits"
                showBreadcrumbs={true}
                breadcrumbItems={[
                    { label: 'Dashboard', href: '/app' },
                    { label: 'Buy Credits' }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Choose Your Credit Pack
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Purchase credits to analyze your JAM recordings and get detailed feedback on your performance.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-800 font-medium">
                            Current Balance: {balance} credits
                        </p>
                    </div>
                </div>

                {/* Payment Error Alert */}
                {paymentError && (
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Payment Error
                                    </h3>
                                    <p className="mt-1 text-sm text-red-700">
                                        {paymentError}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDismissError}
                                    className="ml-3 text-red-400 hover:text-red-600"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing Indicator */}
                {processingPack && (
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Loader2 className="h-5 w-5 text-blue-400 mr-3 animate-spin" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Processing Payment
                                    </h3>
                                    <p className="text-sm text-blue-700">
                                        Please complete your payment in the modal...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Credit Packs */}
                <div className="max-w-5xl mx-auto">
                    <CreditPacksDisplay
                        onPackSelect={handlePackSelect}
                        className="mb-8"
                    />
                </div>

                {/* Additional Info */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            How Credits Work
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Credit Usage</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• 1 credit per feedback analysis</li>
                                    <li>• Credits are deducted after successful analysis</li>
                                    <li>• Failed analyses automatically refund credits</li>
                                    <li>• Credits never expire</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Payment & Security</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Secure payment via Razorpay</li>
                                    <li>• Instant credit delivery</li>
                                    <li>• No recurring charges</li>
                                    <li>• 24/7 customer support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link
                        to="/app"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Payment Success Notification */}
            <PaymentSuccess
                isVisible={showSuccess}
                onClose={handleCloseSuccess}
                creditsAdded={successData.creditsAdded}
                packName={successData.packName}
                newBalance={successData.newBalance}
                message={successData.message}
            />
        </div>
    )
} 