// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090',
    ENDPOINTS: {
        HEALTH: '/health',
        TRANSCRIBE: '/api/v1/transcribe',
        FEEDBACK: '/api/v1/speech/jam'
    }
} as const

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
}

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