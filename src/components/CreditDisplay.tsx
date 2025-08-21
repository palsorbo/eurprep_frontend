
import { useCredits } from '../hooks/useCredits'
import { Coins, AlertCircle } from 'lucide-react'

interface CreditDisplayProps {
    className?: string
    showIcon?: boolean
    compact?: boolean
}

export function CreditDisplay({
    className = '',
    showIcon = true,
    compact = false
}: CreditDisplayProps) {
    const { balance, loading, error } = useCredits()

    const formatCredits = (credits: number): string => {
        return `${credits} credit${credits !== 1 ? 's' : ''}`
    }

    if (loading) {
        return (
            <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
                {showIcon && <Coins className="h-4 w-4 animate-pulse" />}
                <span className="animate-pulse">Loading...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`flex items-center gap-2 text-sm text-red-500 ${className}`}>
                {showIcon && <AlertCircle className="h-4 w-4" />}
                <span>Error loading credits</span>
            </div>
        )
    }

    if (compact) {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                {showIcon && <Coins className="h-4 w-4" />}
                <span className={`font-medium ${balance === 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {balance}
                </span>
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showIcon && (
                <Coins className={`h-4 w-4 ${balance === 0 ? 'text-red-500' : 'text-green-600'}`} />
            )}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">Credits</span>
                <span className={`font-medium text-sm ${balance === 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatCredits(balance)}
                </span>
            </div>
            {balance === 0 && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    <span>Low</span>
                </div>
            )}
        </div>
    )
}

// Compact version for header
export function HeaderCreditDisplay() {
    return <CreditDisplay compact showIcon className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" />
}

// Full version for credit pages
export function FullCreditDisplay() {
    return <CreditDisplay showIcon className="p-4 rounded-lg border border-gray-200 bg-white" />
} 