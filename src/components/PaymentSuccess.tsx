import { CheckCircle, X, Coins } from 'lucide-react'

interface PaymentSuccessProps {
    isVisible: boolean
    onClose: () => void
    creditsAdded: number
    packName: string
    newBalance?: number
    message?: string
}

export default function PaymentSuccess({
    isVisible,
    onClose,
    creditsAdded,
    packName,
    newBalance,
    message
}: PaymentSuccessProps) {
    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Payment Successful!
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Credits Added Successfully
                    </h3>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Coins className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                            +{creditsAdded} credits
                        </span>
                    </div>

                    {newBalance && (
                        <p className="text-sm text-gray-500 mb-2">
                            New balance: {newBalance} credits
                        </p>
                    )}

                    <p className="text-gray-600 mb-4">
                        {message || `Your ${packName} pack has been activated and credits have been added to your account.`}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>What's next?</strong>
                        </p>
                        <ul className="text-left space-y-1">
                            <li>• Start practicing with your new credits</li>
                            <li>• Credits are ready to use immediately</li>
                            <li>• Check your transaction history for details</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start Practicing
                    </button>
                    <button
                        onClick={() => {
                            window.location.href = '/app/transactions'
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        View Transactions
                    </button>
                </div>
            </div>
        </div>
    )
} 