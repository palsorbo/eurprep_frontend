// Log Vite environment variables for debugging
console.log('🔍 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// API Configuration for FlyIO Speech Analysis API
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090",
    ENDPOINTS: {
        HEALTH: '/health',
        TRANSCRIBE: '/api/v1/transcribe',
        FEEDBACK: '/api/v1/speech/jam',
        CREDITS_BALANCE: '/api/v1/credits/balance',
        CREDITS_CONSUME: '/api/v1/credits/consume',
        CREDITS_REFUND: '/api/v1/credits/refund',
        CREDITS_BONUS: '/api/v1/credits/bonus',
        CREDITS_PACKS: '/api/v1/credits/packs',
        CREDITS_TRANSACTIONS: '/api/v1/credits/transactions',
        WEBHOOK_RAZORPAY: '/api/v1/webhooks/razorpay',
        RAZORPAY_CREATE_ORDER: '/api/v1/razorpay/create-order',
        RAZORPAY_PAYMENT_STATUS: '/api/v1/razorpay/payment-status',
        RAZORPAY_PAYMENT_DETAILS: '/api/v1/razorpay/payment'
    }
} as const

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get authentication headers
export const getAuthHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
})

// Helper function to get multipart headers (for file uploads)
export const getMultipartHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`
})

// TypeScript interfaces for API responses
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

export interface GrammarlyHighlight {
    text: string
    start_position: number
    end_position: number
    type: 'filler_word' | 'weak_phrase' | 'formal_term' | 'natural_phrase' | 'pronunciation_issue'
    severity: 'low' | 'medium' | 'high'
    message: string
    suggestions: string[]
    category: 'fluency' | 'vocabulary' | 'grammar' | 'coherence' | 'time_management'
}

export interface FeedbackResponse {
    originalTranscript: string
    version: string
    grammarly_highlights: GrammarlyHighlight[]
    analysis: {
        fluency: {
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
        time_management: {
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
        vocabulary: {
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