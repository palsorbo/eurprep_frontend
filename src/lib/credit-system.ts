import { supabase } from './supabase'
import type {
    CreditTransaction,
    CreditConsumptionParams,
    CreditRefundParams,
    CreditPurchaseParams,
    CreditTransactionResponse,
    CreditValidationResponse
} from './types/credit'
import { getCreditPackById } from './config/credit-packs'

// Constants
export const CREDITS_PER_ANALYSIS = 1

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No record found, create one with upsert to avoid race conditions
                const { data: newRecord, error: createError } = await supabase
                    .from('user_credits')
                    .upsert({
                        user_id: userId,
                        balance: 0
                    })
                    .select('balance')
                    .single()

                if (createError) throw createError
                return newRecord?.balance || 0
            }
            throw error
        }

        return data?.balance || 0
    } catch (error) {
        console.error('Error getting user credits:', error)
        return 0
    }
}



/**
 * Check if user has sufficient credits for analysis
 */
export async function hasSufficientCredits(userId: string): Promise<CreditValidationResponse> {
    const currentBalance = await getUserCredits(userId)
    const requiredCredits = CREDITS_PER_ANALYSIS

    return {
        has_sufficient_credits: currentBalance >= requiredCredits,
        current_balance: currentBalance,
        required_credits: requiredCredits,
        message: currentBalance >= requiredCredits
            ? 'Sufficient credits available'
            : `Insufficient credits. You need ${requiredCredits} credit(s) but have ${currentBalance}`
    }
}

/**
 * Consume credits for feedback analysis
 */
export async function consumeCredits(params: CreditConsumptionParams): Promise<CreditTransactionResponse> {
    const { userId, recordingId, description, metadata } = params

    try {
        // Get current balance
        const currentBalance = await getUserCredits(userId)

        if (currentBalance < CREDITS_PER_ANALYSIS) {
            return {
                success: false,
                new_balance: currentBalance,
                transaction_id: '',
                message: 'Insufficient credits for analysis'
            }
        }

        // Calculate new balance
        const newBalance = currentBalance - CREDITS_PER_ANALYSIS

        // Update user credits
        const { error: updateError } = await supabase
            .from('user_credits')
            .upsert({
                user_id: userId,
                balance: newBalance,
                updated_at: new Date().toISOString()
            })

        if (updateError) throw updateError

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                transaction_type: 'consumption',
                amount: -CREDITS_PER_ANALYSIS,
                balance_before: currentBalance,
                balance_after: newBalance,
                description: description || 'Credit consumed for feedback analysis',
                metadata: metadata || {},
                recording_id: recordingId
            })
            .select()
            .single()

        if (transactionError) throw transactionError

        return {
            success: true,
            new_balance: newBalance,
            transaction_id: transaction.id,
            message: 'Credits consumed successfully'
        }
    } catch (error) {
        console.error('Error consuming credits:', error)
        return {
            success: false,
            new_balance: await getUserCredits(userId),
            transaction_id: '',
            message: 'Failed to consume credits'
        }
    }
}

/**
 * Refund credits on analysis failure
 */
export async function refundCredits(params: CreditRefundParams): Promise<CreditTransactionResponse> {
    const { userId, recordingId, reason, metadata } = params

    try {
        // Get current balance
        const currentBalance = await getUserCredits(userId)

        // Calculate new balance
        const newBalance = currentBalance + CREDITS_PER_ANALYSIS

        // Update user credits
        const { error: updateError } = await supabase
            .from('user_credits')
            .upsert({
                user_id: userId,
                balance: newBalance,
                updated_at: new Date().toISOString()
            })

        if (updateError) throw updateError

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                transaction_type: 'refund',
                amount: CREDITS_PER_ANALYSIS,
                balance_before: currentBalance,
                balance_after: newBalance,
                description: `Credit refund: ${reason}`,
                metadata: metadata || {},
                recording_id: recordingId
            })
            .select()
            .single()

        if (transactionError) throw transactionError

        return {
            success: true,
            new_balance: newBalance,
            transaction_id: transaction.id,
            message: 'Credits refunded successfully'
        }
    } catch (error) {
        console.error('Error refunding credits:', error)
        return {
            success: false,
            new_balance: await getUserCredits(userId),
            transaction_id: '',
            message: 'Failed to refund credits'
        }
    }
}

/**
 * Add credits from purchase
 */
export async function addCreditsFromPurchase(params: CreditPurchaseParams): Promise<CreditTransactionResponse> {
    const { userId, packId, paymentId, metadata } = params

    try {
        const pack = getCreditPackById(packId)
        if (!pack) {
            return {
                success: false,
                new_balance: await getUserCredits(userId),
                transaction_id: '',
                message: 'Invalid credit pack'
            }
        }

        // Get current balance
        const currentBalance = await getUserCredits(userId)

        // Calculate new balance (including bonus)
        const newBalance = currentBalance + pack.total

        // Update user credits
        const { error: updateError } = await supabase
            .from('user_credits')
            .upsert({
                user_id: userId,
                balance: newBalance,
                updated_at: new Date().toISOString()
            })

        if (updateError) throw updateError

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                transaction_type: 'purchase',
                amount: pack.total,
                balance_before: currentBalance,
                balance_after: newBalance,
                description: `Purchased ${pack.name} pack: ${pack.credits} credits + ${pack.bonus} bonus`,
                metadata: {
                    ...metadata,
                    pack_id: packId,
                    pack_name: pack.name,
                    base_credits: pack.credits,
                    bonus_credits: pack.bonus,
                    price: pack.price
                },
                payment_id: paymentId
            })
            .select()
            .single()

        if (transactionError) throw transactionError

        return {
            success: true,
            new_balance: newBalance,
            transaction_id: transaction.id,
            message: `Successfully added ${pack.total} credits`
        }
    } catch (error) {
        console.error('Error adding credits from purchase:', error)
        return {
            success: false,
            new_balance: await getUserCredits(userId),
            transaction_id: '',
            message: 'Failed to add credits from purchase'
        }
    }
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(userId: string, limit = 10): Promise<CreditTransaction[]> {
    try {
        const { data, error } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return data || []
    } catch (error) {
        console.error('Error getting user transactions:', error)
        return []
    }
}

/**
 * Format credit balance for display
 */
export function formatCredits(credits: number): string {
    return `${credits} credit${credits !== 1 ? 's' : ''}`
}

/**
 * Check if user can perform analysis
 */
export async function canPerformAnalysis(userId: string): Promise<boolean> {
    const validation = await hasSufficientCredits(userId)
    return validation.has_sufficient_credits
} 