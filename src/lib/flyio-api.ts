// FlyIO Speech Analysis API Integration
// This file contains functions for handling API calls to the FlyIO backend

import { supabase } from './supabase'
import { API_CONFIG, getApiUrl, getAuthHeaders, getMultipartHeaders } from './config'
import type {
    ApiResponse,
    TranscriptionResponse,
    FeedbackRequest,
    FeedbackResponse,
    CreditBalanceResponse,
    CreditConsumeRequest,
    CreditConsumeResponse,
    CreditRefundRequest,
    CreditRefundResponse,
    CreditBonusRequest,
    CreditBonusResponse,
    CreditPacksResponse,
    CreditTransactionsResponse,
    RazorpayWebhookPayload,
    WebhookResponse
} from './types/api'

/**
 * Get JWT token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token || null
    } catch (error) {
        console.error('Error getting auth token:', error)
        return null
    }
}

/**
 * Make authenticated API request
 */
async function makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = await getAuthToken()

    if (!token) {
        return {
            success: false,
            error: 'Authentication required'
        }
    }

    const url = getApiUrl(endpoint)
    const headers = {
        ...getAuthHeaders(token),
        ...options.headers
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                success: false,
                error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
            }
        }

        return await response.json()
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        }
    }
}

/**
 * Check if backend service is available
 */
export async function checkBackendAvailability(): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
            method: 'GET',
            signal: controller.signal
        })

        clearTimeout(timeoutId)
        return response.ok
    } catch (error) {
        console.warn('Backend service not available:', error)
        return false
    }
}

/**
 * Transcribe audio blob with authentication
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string; error?: string }> {
    try {
        const token = await getAuthToken()

        if (!token) {
            return {
                text: '',
                error: 'Authentication required'
            }
        }

        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TRANSCRIBE), {
            method: 'POST',
            headers: getMultipartHeaders(token),
            body: formData
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || `Transcription failed: ${response.status}`)
        }

        const data: ApiResponse<TranscriptionResponse> = await response.json()

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Transcription failed')
        }

        return { text: data.data.text }
    } catch (error) {
        return {
            text: '',
            error: error instanceof Error ? error.message : 'Transcription failed'
        }
    }
}

/**
 * Get feedback analysis for transcript with authentication
 */
export async function getFeedbackAnalysis(request: FeedbackRequest): Promise<{ data?: FeedbackResponse; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<FeedbackResponse>(
            API_CONFIG.ENDPOINTS.FEEDBACK,
            {
                method: 'POST',
                body: JSON.stringify(request)
            }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Feedback analysis failed'
            }
        }

        return { data: response.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Feedback analysis failed'
        }
    }
}

/**
 * Get user's credit balance
 */
export async function getCreditBalance(): Promise<{ balance?: number; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<CreditBalanceResponse>(
            API_CONFIG.ENDPOINTS.CREDITS_BALANCE,
            { method: 'GET' }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Failed to get credit balance'
            }
        }

        return { balance: response.data.balance }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to get credit balance'
        }
    }
}

/**
 * Consume credits for feedback analysis
 */
export async function consumeCredits(request: CreditConsumeRequest): Promise<{ data?: CreditConsumeResponse; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<CreditConsumeResponse>(
            API_CONFIG.ENDPOINTS.CREDITS_CONSUME,
            {
                method: 'POST',
                body: JSON.stringify(request)
            }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Failed to consume credits'
            }
        }

        return { data: response.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to consume credits'
        }
    }
}

/**
 * Refund credits on analysis failure
 */
export async function refundCredits(request: CreditRefundRequest): Promise<{ data?: CreditRefundResponse; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<CreditRefundResponse>(
            API_CONFIG.ENDPOINTS.CREDITS_REFUND,
            {
                method: 'POST',
                body: JSON.stringify(request)
            }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Failed to refund credits'
            }
        }

        return { data: response.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to refund credits'
        }
    }
}

/**
 * Add bonus credits to user
 */
export async function addBonusCredits(request: CreditBonusRequest): Promise<{ data?: CreditBonusResponse; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<CreditBonusResponse>(
            API_CONFIG.ENDPOINTS.CREDITS_BONUS,
            {
                method: 'POST',
                body: JSON.stringify(request)
            }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Failed to add bonus credits'
            }
        }

        return { data: response.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to add bonus credits'
        }
    }
}

/**
 * Get available credit packs
 */
export async function getCreditPacks(): Promise<{ data?: CreditPacksResponse; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<CreditPacksResponse>(
            API_CONFIG.ENDPOINTS.CREDITS_PACKS,
            { method: 'GET' }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Failed to get credit packs'
            }
        }

        return { data: response.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to get credit packs'
        }
    }
}

/**
 * Get user's transaction history
 */
export async function getCreditTransactions(): Promise<{ data?: CreditTransactionsResponse; error?: string }> {
    try {
        const response = await makeAuthenticatedRequest<CreditTransactionsResponse>(
            API_CONFIG.ENDPOINTS.CREDITS_TRANSACTIONS,
            { method: 'GET' }
        )

        if (!response.success || !response.data) {
            return {
                error: response.error || 'Failed to get transaction history'
            }
        }

        return { data: response.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to get transaction history'
        }
    }
}

/**
 * Process Razorpay webhook
 */
export async function processRazorpayWebhook(payload: RazorpayWebhookPayload): Promise<{ data?: WebhookResponse; error?: string }> {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.WEBHOOK_RAZORPAY), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                error: errorData.error || `Webhook processing failed: ${response.status}`
            }
        }

        const data: WebhookResponse = await response.json()
        return { data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Webhook processing failed'
        }
    }
}

/**
 * Complete analysis workflow: transcribe, consume credits, get feedback
 */
export async function completeAnalysisWorkflow(
    audioBlob: Blob,
    topic: string,
    duration: number,
    recordingId: string
): Promise<{
    transcription?: { text: string }
    feedback?: FeedbackResponse
    error?: string
}> {
    try {
        // Step 1: Transcribe audio
        const transcription = await transcribeAudio(audioBlob)
        if (transcription.error) {
            return { error: `Transcription failed: ${transcription.error}` }
        }

        // Step 2: Consume credits
        const consumeResult = await consumeCredits({
            recordingId,
            description: 'JAM feedback analysis',
            metadata: {
                topic,
                duration
            }
        })

        if (consumeResult.error) {
            return { error: `Credit consumption failed: ${consumeResult.error}` }
        }

        // Step 3: Get feedback analysis
        const feedbackResult = await getFeedbackAnalysis({
            text: transcription.text,
            topic,
            duration
        })

        if (feedbackResult.error) {
            // If feedback fails, refund credits
            await refundCredits({
                recordingId,
                reason: 'Feedback analysis failed',
                metadata: {
                    issue_type: 'analysis_error',
                    original_error: feedbackResult.error
                }
            })

            return { error: `Feedback analysis failed: ${feedbackResult.error}` }
        }

        return {
            transcription: { text: transcription.text },
            feedback: feedbackResult.data
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Analysis workflow failed'
        }
    }
} 