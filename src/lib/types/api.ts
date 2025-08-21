// FlyIO Speech Analysis API Types

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    meta?: {
        version: string
        timestamp: string
        hasTimingData?: boolean
    }
}

export interface TranscriptionResponse {
    text: string
}

// Credit System Types
export interface CreditBalanceResponse {
    balance: number
    user_id: string
}

export interface CreditConsumeRequest {
    recordingId: string
    description?: string
    metadata?: {
        topic?: string
        duration?: number
    }
}

export interface CreditConsumeResponse {
    new_balance: number
    transaction_id: string
    message: string
}

export interface CreditRefundRequest {
    recordingId: string
    reason: string
    metadata?: {
        issue_type?: string
        original_error?: string
    }
}

export interface CreditRefundResponse {
    new_balance: number
    transaction_id: string
    message: string
}

export interface CreditBonusRequest {
    amount: number
    reason: string
    metadata?: {
        bonus_type?: string
        campaign?: string
    }
}

export interface CreditBonusResponse {
    new_balance: number
    transaction_id: string
    message: string
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
    features: string[]
}

export interface CreditPacksResponse {
    packs: CreditPack[]
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
    payment_id?: string
    recording_id?: string
    created_at: string
}

export interface CreditTransactionsResponse {
    transactions: CreditTransaction[]
    user_id: string
}

// Webhook Types
export interface RazorpayWebhookPayload {
    event: string
    payload: {
        payment: {
            entity: {
                id: string
                amount: number
                currency: string
                notes: {
                    pack_id: string
                    user_id: string
                }
            }
        }
    }
}

export interface WebhookResponse {
    success: boolean
    message: string
    data?: {
        newBalance: number
    }
}

export interface FeedbackResponse {
    originalTranscript: string
    version: string
    analysis: {
        fluency: {
            score: {
                raw_score: number
                weight: number
                weighted_score: number
            }
            issues: Array<{
                id?: string
                type: string
                description: string
                severity?: number
                priority?: number
                confidence?: number
                span?: {
                    text: string
                    start_s?: number
                    end_s?: number
                    token_start?: number
                    token_end?: number
                }
                examples: Array<{
                    original: string
                    improved: string
                    explanation: string
                    variations?: string[]
                }>
                drills?: Array<{
                    prompt: string
                    eta_min?: number
                    goal?: string
                }>
                tags?: string[]
            }>
            suggestions: string[]
            filler_words: {
                count: {
                    um: number
                    uh: number
                    like: number
                    you_know: number
                    other: number
                }
                total_fillers: number
                density_per_minute: number
            }
            pause_analysis: {
                total_pauses: number
                average_pause_duration: number
                longest_pause: number
            }
        }
        coherence: {
            score: {
                raw_score: number
                weight: number
                weighted_score: number
            }
            issues: Array<{
                id?: string
                type: string
                description: string
                severity?: number
                priority?: number
                confidence?: number
                span?: {
                    text: string
                    start_s?: number
                    end_s?: number
                    token_start?: number
                    token_end?: number
                }
                examples: Array<{
                    original: string
                    improved: string
                    explanation: string
                    variations?: string[]
                }>
                drills?: Array<{
                    prompt: string
                    eta_min?: number
                    goal?: string
                }>
                tags?: string[]
            }>
            suggestions: string[]
        }
        time_management: {
            score: {
                raw_score: number
                weight: number
                weighted_score: number
            }
            issues: Array<{
                id?: string
                type: string
                description: string
                severity?: number
                priority?: number
                confidence?: number
                span?: {
                    text: string
                    start_s?: number
                    end_s?: number
                    token_start?: number
                    token_end?: number
                }
                examples: Array<{
                    original: string
                    improved: string
                    explanation: string
                    variations?: string[]
                }>
                drills?: Array<{
                    prompt: string
                    eta_min?: number
                    goal?: string
                }>
                tags?: string[]
            }>
            suggestions: string[]
        }
        vocabulary: {
            score: {
                raw_score: number
                weight: number
                weighted_score: number
            }
            issues: Array<{
                id?: string
                type: string
                description: string
                severity?: number
                priority?: number
                confidence?: number
                span?: {
                    text: string
                    start_s?: number
                    end_s?: number
                    token_start?: number
                    token_end?: number
                }
                examples: Array<{
                    original: string
                    improved: string
                    explanation: string
                    variations?: string[]
                }>
                drills?: Array<{
                    prompt: string
                    eta_min?: number
                    goal?: string
                }>
                tags?: string[]
            }>
            suggestions: string[]
        }
        grammar: {
            score: {
                raw_score: number
                weight: number
                weighted_score: number
            }
            issues: Array<{
                type: string
                description: string
                examples: Array<{
                    original: string
                    improved: string
                    explanation: string
                }>
            }>
            suggestions: string[]
        }
    }
    time_usage: {
        speaking_time_seconds: number
        pauses_seconds: number
        speech_rate_wpm: number
        time_efficiency_percentage: number
        pause_distribution: {
            start_pauses: number
            middle_pauses: number
            end_pauses: number
            nervousness_score: number
        }
        wpm_analysis: {
            performance_rating: string
            target_range: string
            recommendation: string
            color: string
        }
    }
    summary: {
        overallScore: number
        weightedOverallScore: number
        strengths: string[]
        areasForImprovement: string[]
        generalAdvice: string
        topPriorities: string[]
    }
    metadata: {
        textLength: number
        wordCount: number
        analysisVersion: string
        modelUsed: string
        analysisTimestamp: string
    }
    recommendations: {
        immediate: string[]
        shortTerm: string[]
        longTerm: string[]
    }
}

export interface FeedbackRequest {
    text: string
    topic: string
    duration?: number
    segments?: Array<{
        start: number
        end: number
        text: string
    }>
    // Optional recording linkage for server-side persistence and credit handling
    recordingId?: string
} 