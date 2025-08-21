export interface UserCredits {
    id: string
    user_id: string
    balance: number
    created_at: string
    updated_at: string
}

export interface CreditTransaction {
    id: string
    user_id: string
    transaction_type: 'purchase' | 'consumption' | 'refund' | 'bonus'
    amount: number
    balance_before: number
    balance_after: number
    description: string
    metadata?: Record<string, any>
    recording_id?: string
    payment_id?: string
    created_at: string
}

export interface CreditPack {
    id: string
    name: string
    price: number
    credits: number
    bonus: number
    total: number
    description: string
    popular: boolean
    features?: string[]
}

export interface CreditConsumptionParams {
    userId: string
    recordingId: string
    description?: string
    metadata?: Record<string, any>
}

export interface CreditRefundParams {
    userId: string
    recordingId: string
    reason: string
    metadata?: Record<string, any>
}

export interface CreditPurchaseParams {
    userId: string
    packId: string
    paymentId: string
    metadata?: Record<string, any>
}

export interface CreditBalanceResponse {
    balance: number
    user_id: string
}

export interface CreditTransactionResponse {
    success: boolean
    new_balance: number
    transaction_id: string
    message?: string
}

export interface CreditValidationResponse {
    has_sufficient_credits: boolean
    current_balance: number
    required_credits: number
    message?: string
} 