import { useCredits } from '../hooks/useCredits'
import { Coins, Star, Check } from 'lucide-react'
import type { CreditPack } from '../lib/types/api'

interface CreditPacksDisplayProps {
    className?: string
    onPackSelect?: (pack: CreditPack) => void
}

export function CreditPacksDisplay({ className = '', onPackSelect }: CreditPacksDisplayProps) {
    const { packs, loading, error } = useCredits()

    if (loading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 border border-gray-200 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className={`p-6 border border-red-200 rounded-lg bg-red-50 ${className}`}>
                <div className="flex items-center gap-2 text-red-600">
                    <Coins className="h-5 w-5" />
                    <span>Error loading credit packs: {error}</span>
                </div>
            </div>
        )
    }

    if (packs.length === 0) {
        return (
            <div className={`p-6 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
                <div className="text-center text-gray-500">
                    <Coins className="h-8 w-8 mx-auto mb-2" />
                    <p>No credit packs available</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
            {packs.map((pack) => (
                <div
                    key={pack.id}
                    className={`p-6 border rounded-lg transition-all hover:shadow-md cursor-pointer ${pack.popular
                        ? 'border-blue-300 bg-blue-50 relative'
                        : 'border-gray-200 bg-white'
                        }`}
                    onClick={() => onPackSelect?.(pack)}
                >
                    {pack.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Most Popular
                            </div>
                        </div>
                    )}

                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{pack.name}</h3>
                        <p className="text-sm text-gray-600">{pack.description}</p>
                    </div>

                    <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-gray-900">₹{pack.price}</div>
                        <div className="text-sm text-gray-500">one-time payment</div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Coins className="h-5 w-5 text-green-600" />
                            <span className="text-lg font-semibold text-green-600">
                                {pack.total} credits
                            </span>
                        </div>
                        {pack.bonus > 0 && (
                            <div className="text-center text-sm text-green-600">
                                +{pack.bonus} bonus credits
                            </div>
                        )}
                    </div>

                    <ul className="space-y-2 mb-6">
                        {pack.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${pack.popular
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                    >
                        Get Started
                    </button>
                </div>
            ))}
        </div>
    )
}

// Compact version for sidebar or smaller displays
export function CompactCreditPacksDisplay({ className = '', onPackSelect }: CreditPacksDisplayProps) {
    const { packs, loading, error } = useCredits()

    if (loading) {
        return (
            <div className={`space-y-3 ${className}`}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (error || packs.length === 0) {
        return (
            <div className={`p-4 border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
                <div className="text-center text-gray-500">
                    <Coins className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">No packs available</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {packs.map((pack) => (
                <div
                    key={pack.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${pack.popular ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                    onClick={() => onPackSelect?.(pack)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{pack.name}</h4>
                        {pack.popular && (
                            <Star className="h-4 w-4 text-blue-500" />
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                                {pack.total} credits
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">₹{pack.price}</span>
                    </div>
                </div>
            ))}
        </div>
    )
} 