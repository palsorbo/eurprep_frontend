import { useCredits } from '../hooks/useCredits'
import { Coins, ArrowUpRight, Plus, Minus, Clock } from 'lucide-react'
import type { CreditTransaction } from '../lib/types/api'

interface TransactionHistoryProps {
    className?: string
    limit?: number
}

export function TransactionHistory({ className = '', limit = 10 }: TransactionHistoryProps) {
    const { transactions, loading, error } = useCredits()

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTransactionIcon = (type: CreditTransaction['transaction_type']) => {
        switch (type) {
            case 'purchase':
                return <Plus className="h-4 w-4 text-green-600" />
            case 'consumption':
                return <Minus className="h-4 w-4 text-red-600" />
            case 'refund':
                return <ArrowUpRight className="h-4 w-4 text-blue-600" />
            case 'bonus':
                return <Coins className="h-4 w-4 text-yellow-600" />
            default:
                return <Clock className="h-4 w-4 text-gray-600" />
        }
    }

    const getTransactionColor = (type: CreditTransaction['transaction_type']) => {
        switch (type) {
            case 'purchase':
                return 'text-green-600'
            case 'consumption':
                return 'text-red-600'
            case 'refund':
                return 'text-blue-600'
            case 'bonus':
                return 'text-yellow-600'
            default:
                return 'text-gray-600'
        }
    }

    const getTransactionLabel = (type: CreditTransaction['transaction_type']) => {
        switch (type) {
            case 'purchase':
                return 'Purchase'
            case 'consumption':
                return 'Used'
            case 'refund':
                return 'Refund'
            case 'bonus':
                return 'Bonus'
            default:
                return 'Transaction'
        }
    }

    if (loading) {
        return (
            <div className={`space-y-3 ${className}`}>
                {Array.from({ length: limit }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg animate-pulse">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
                <div className="flex items-center gap-2 text-red-600">
                    <Coins className="h-5 w-5" />
                    <span>Error loading transactions: {error}</span>
                </div>
            </div>
        )
    }

    if (transactions.length === 0) {
        return (
            <div className={`p-6 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
                <div className="text-center text-gray-500">
                    <Coins className="h-8 w-8 mx-auto mb-2" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Your transaction history will appear here</p>
                </div>
            </div>
        )
    }

    const displayTransactions = transactions.slice(0, limit)

    return (
        <div className={`space-y-3 ${className}`}>
            {displayTransactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.transaction_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 truncate">
                                {getTransactionLabel(transaction.transaction_type)}
                            </span>
                            <span className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate">
                                {transaction.description}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatDate(transaction.created_at)}
                            </span>
                        </div>

                        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                            <div className="mt-1">
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(transaction.metadata).map(([key, value]) => (
                                        <span
                                            key={key}
                                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                        >
                                            {key}: {String(value)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {transactions.length > limit && (
                <div className="text-center text-sm text-gray-500 py-2">
                    Showing {limit} of {transactions.length} transactions
                </div>
            )}
        </div>
    )
}

// Compact version for sidebar
export function CompactTransactionHistory({ className = '', limit = 5 }: TransactionHistoryProps) {
    const { transactions, loading, error } = useCredits()

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }
    }

    const getTransactionIcon = (type: CreditTransaction['transaction_type']) => {
        switch (type) {
            case 'purchase':
                return <Plus className="h-3 w-3 text-green-600" />
            case 'consumption':
                return <Minus className="h-3 w-3 text-red-600" />
            case 'refund':
                return <ArrowUpRight className="h-3 w-3 text-blue-600" />
            case 'bonus':
                return <Coins className="h-3 w-3 text-yellow-600" />
            default:
                return <Clock className="h-3 w-3 text-gray-600" />
        }
    }

    if (loading) {
        return (
            <div className={`space-y-2 ${className}`}>
                {Array.from({ length: limit }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 animate-pulse">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error || transactions.length === 0) {
        return (
            <div className={`p-3 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
                <div className="text-center text-gray-500">
                    <Coins className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-xs">No transactions</p>
                </div>
            </div>
        )
    }

    const displayTransactions = transactions.slice(0, limit)

    return (
        <div className={`space-y-2 ${className}`}>
            {displayTransactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors"
                >
                    {getTransactionIcon(transaction.transaction_type)}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 truncate">
                                {transaction.description}
                            </span>
                            <span className={`text-xs font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </span>
                        </div>
                    </div>

                    <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(transaction.created_at)}
                    </span>
                </div>
            ))}
        </div>
    )
} 