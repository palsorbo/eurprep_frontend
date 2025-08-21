import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import { TransactionHistory } from '../components/TransactionHistory'
import { CreditDisplay } from '../components/CreditDisplay'

export default function TransactionHistoryPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <AuthenticatedHeader
                pageTitle="Transaction History"
                showBreadcrumbs={true}
                breadcrumbItems={[
                    { label: 'Dashboard', href: '/app' },
                    { label: 'Transaction History' }
                ]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Transaction History
                    </h1>
                    <p className="text-lg text-gray-600">
                        View your credit purchase and usage history
                    </p>
                </div>

                {/* Current Balance */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Current Balance
                        </h2>
                        <CreditDisplay />
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Transactions
                    </h2>
                    <TransactionHistory limit={20} />
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
        </div>
    )
} 