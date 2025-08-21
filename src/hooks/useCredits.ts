import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../lib/auth-context'
import {
    getCreditBalance,
    getCreditPacks,
    getCreditTransactions,
    addBonusCredits,
    consumeCredits,
    refundCredits
} from '../lib/flyio-api'
import type { CreditPack, CreditTransaction } from '../lib/types/api'

interface UseCreditsReturn {
    balance: number
    loading: boolean
    error: string | null
    packs: CreditPack[]
    transactions: CreditTransaction[]
    refreshBalance: () => Promise<void>
    refreshPacks: () => Promise<void>
    refreshTransactions: () => Promise<void>
    addBonus: (amount: number, reason: string) => Promise<{ success: boolean; error?: string }>
    consume: (recordingId: string, description?: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
    refund: (recordingId: string, reason: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
}

export function useCredits(): UseCreditsReturn {
    const { user } = useAuth()
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [packs, setPacks] = useState<CreditPack[]>([])
    const [transactions, setTransactions] = useState<CreditTransaction[]>([])

    const refreshBalance = useCallback(async () => {
        if (!user) return

        try {
            setError(null)
            const result = await getCreditBalance()

            if (result.error) {
                setError(result.error)
            } else if (result.balance !== undefined) {
                setBalance(result.balance)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch balance')
        }
    }, [user])

    const refreshPacks = useCallback(async () => {
        if (!user) return

        try {
            setError(null)
            const result = await getCreditPacks()

            if (result.error) {
                setError(result.error)
            } else if (result.data) {
                setPacks(result.data.packs)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch credit packs')
        }
    }, [user])

    const refreshTransactions = useCallback(async () => {
        if (!user) return

        try {
            setError(null)
            const result = await getCreditTransactions()

            if (result.error) {
                setError(result.error)
            } else if (result.data) {
                setTransactions(result.data.transactions)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
        }
    }, [user])

    const addBonus = useCallback(async (amount: number, reason: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            const result = await addBonusCredits({ amount, reason })

            if (result.error) {
                return { success: false, error: result.error }
            }

            // Refresh balance after adding bonus
            await refreshBalance()
            return { success: true }
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to add bonus credits' }
        }
    }, [user, refreshBalance])

    const consume = useCallback(async (recordingId: string, description?: string, metadata?: any): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            const result = await consumeCredits({ recordingId, description, metadata })

            if (result.error) {
                return { success: false, error: result.error }
            }

            // Refresh balance after consuming credits
            await refreshBalance()
            return { success: true }
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to consume credits' }
        }
    }, [user, refreshBalance])

    const refund = useCallback(async (recordingId: string, reason: string, metadata?: any): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'User not authenticated' }
        }

        try {
            const result = await refundCredits({ recordingId, reason, metadata })

            if (result.error) {
                return { success: false, error: result.error }
            }

            // Refresh balance after refunding credits
            await refreshBalance()
            return { success: true }
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to refund credits' }
        }
    }, [user, refreshBalance])

    // Initial load
    useEffect(() => {
        if (user) {
            setLoading(true)
            Promise.all([
                refreshBalance(),
                refreshPacks(),
                refreshTransactions()
            ]).finally(() => setLoading(false))
        } else {
            setBalance(0)
            setPacks([])
            setTransactions([])
            setLoading(false)
        }
    }, [user, refreshBalance, refreshPacks, refreshTransactions])

    return {
        balance,
        loading,
        error,
        packs,
        transactions,
        refreshBalance,
        refreshPacks,
        refreshTransactions,
        addBonus,
        consume,
        refund
    }
}

// Hook for checking if user can perform analysis
export function useCanPerformAnalysis(): {
    canPerform: boolean
    loading: boolean
    error: string | null
    checkAnalysis: () => Promise<boolean>
} {
    const { user } = useAuth()
    const [canPerform, setCanPerform] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const checkAnalysis = useCallback(async (): Promise<boolean> => {
        if (!user?.id) {
            setCanPerform(false)
            setLoading(false)
            return false
        }

        try {
            setLoading(true)
            setError(null)

            // Import here to avoid circular dependencies
            const { hasSufficientCredits } = await import('../lib/credit-system')
            const validation = await hasSufficientCredits(user.id)

            setCanPerform(validation.has_sufficient_credits)
            return validation.has_sufficient_credits
        } catch (err) {
            console.error('Error checking analysis capability:', err)
            setError('Failed to check credit availability')
            setCanPerform(false)
            return false
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        checkAnalysis()
    }, [checkAnalysis])

    return {
        canPerform,
        loading,
        error,
        checkAnalysis
    }
} 