// API utilities for Courage App
// This file contains functions for handling external API calls

import type { ApiResponse, TranscriptionResponse, FeedbackResponse, FeedbackRequest } from './types/api'

// API configuration
const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.eurprep.com',
    ENDPOINTS: {
        TRANSCRIBE: '/api/v1/transcribe',
        FEEDBACK: '/api/v1/speech/jam'
    }
}

/**
 * Get API URL for a specific endpoint
 * @param endpoint - API endpoint
 * @returns Full API URL
 */
function getApiUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`
}

/**
 * Check if backend service is available
 * @returns Promise<boolean>
 */
export async function checkBackendAvailability(): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(getApiUrl('/health'), {
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
 * Transcribe audio blob
 * @param audioBlob - Audio blob to transcribe
 * @returns Promise with transcription result
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string; error?: string }> {
    try {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TRANSCRIBE), {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status} ${response.statusText}`)
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
 * Get feedback analysis for transcript
 * @param request - Feedback request data
 * @returns Promise with feedback result
 */
export async function getFeedbackAnalysis(request: FeedbackRequest): Promise<{ data?: FeedbackResponse; error?: string }> {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FEEDBACK), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })

        if (!response.ok) {
            throw new Error(`Feedback analysis failed: ${response.status} ${response.statusText}`)
        }

        const data: ApiResponse<FeedbackResponse> = await response.json()

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Feedback analysis failed')
        }

        return { data: data.data }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Feedback analysis failed'
        }
    }
}

/**
 * Generate mock feedback data for fallback
 * @param topicTitle - Topic title
 * @param duration - Recording duration in seconds
 * @returns Mock feedback response
 */
export function generateMockFeedback(_topicTitle: string, duration: number): ApiResponse<FeedbackResponse> {
    const mockAnalysis = {
        fluency: {
            score: {
                raw_score: Math.floor(Math.random() * 3) + 6,
                weight: 0.30,
                weighted_score: Math.floor(Math.random() * 3) + 1.5
            },
            issues: [
                {
                    type: "filler_words",
                    description: "Some filler words detected",
                    examples: [
                        {
                            original: "So um, I was thinking about",
                            improved: "I was thinking about",
                            explanation: "Remove filler words 'so' and 'um'"
                        }
                    ]
                }
            ],
            suggestions: [
                "Practice speaking without filler words",
                "Take brief pauses instead of using 'um' or 'uh'"
            ],
            filler_words: {
                count: {
                    um: Math.floor(Math.random() * 3),
                    uh: Math.floor(Math.random() * 2),
                    like: Math.floor(Math.random() * 2),
                    you_know: Math.floor(Math.random() * 2),
                    other: 0
                },
                total_fillers: Math.floor(Math.random() * 5) + 2,
                density_per_minute: Math.floor(Math.random() * 5) + 3
            },
            pause_analysis: {
                total_pauses: Math.floor(Math.random() * 4) + 2,
                average_pause_duration: Math.random() * 2 + 0.5,
                longest_pause: Math.random() * 3 + 1
            }
        },
        coherence: {
            score: {
                raw_score: Math.floor(Math.random() * 3) + 5,
                weight: 0.25,
                weighted_score: Math.floor(Math.random() * 3) + 1.0
            },
            issues: [
                {
                    type: "structure",
                    description: "Could improve logical flow",
                    examples: []
                }
            ],
            suggestions: [
                "Organize thoughts before speaking",
                "Use transition words to connect ideas"
            ]
        },
        time_management: {
            score: {
                raw_score: Math.floor(Math.random() * 3) + 6,
                weight: 0.20,
                weighted_score: Math.floor(Math.random() * 3) + 1.1
            },
            issues: [
                {
                    type: "pace",
                    description: "Speaking pace could be more consistent",
                    examples: []
                }
            ],
            suggestions: [
                "Practice maintaining steady speaking pace",
                "Use timing cues to stay on track"
            ]
        },
        vocabulary: {
            score: {
                raw_score: Math.floor(Math.random() * 3) + 5,
                weight: 0.15,
                weighted_score: Math.floor(Math.random() * 3) + 0.7
            },
            issues: [
                {
                    type: "repetition",
                    description: "Some words are overused",
                    examples: []
                }
            ],
            suggestions: [
                "Expand vocabulary with synonyms",
                "Avoid repetitive phrases"
            ]
        },
        grammar: {
            score: {
                raw_score: Math.floor(Math.random() * 3) + 6,
                weight: 0.10,
                weighted_score: Math.floor(Math.random() * 3) + 0.5
            },
            issues: [
                {
                    type: "minor_errors",
                    description: "Minor grammatical issues",
                    examples: []
                }
            ],
            suggestions: [
                "Review basic grammar rules",
                "Practice sentence structure"
            ]
        }
    }

    const overallScore = Math.floor(Math.random() * 3) + 6

    return {
        success: true,
        data: {
            originalTranscript: "This is a mock transcript for demonstration purposes.",
            version: "1.0",
            analysis: mockAnalysis,
            time_usage: {
                speaking_time_seconds: duration * 0.8,
                pauses_seconds: duration * 0.2,
                speech_rate_wpm: Math.floor(Math.random() * 20) + 120,
                time_efficiency_percentage: Math.floor(Math.random() * 20) + 70,
                pause_distribution: {
                    start_pauses: Math.floor(Math.random() * 3),
                    middle_pauses: Math.floor(Math.random() * 4) + 1,
                    end_pauses: Math.floor(Math.random() * 2),
                    nervousness_score: Math.random() * 3 + 1
                },
                wpm_analysis: {
                    performance_rating: "Good",
                    target_range: "120-150 WPM",
                    recommendation: "Maintain current pace",
                    color: "green"
                }
            },
            summary: {
                overallScore,
                weightedOverallScore: overallScore - 0.3,
                strengths: ["Clear articulation", "Good pace"],
                areasForImprovement: ["Reduce filler words", "Improve structure"],
                generalAdvice: "Continue practicing regularly to improve fluency.",
                topPriorities: ["Work on reducing filler words", "Practice organizing thoughts"]
            },
            metadata: {
                textLength: 150,
                wordCount: 25,
                analysisVersion: "1.0",
                modelUsed: "mock-model",
                analysisTimestamp: new Date().toISOString()
            },
            recommendations: {
                immediate: ["Practice breathing exercises"],
                shortTerm: ["Record yourself daily"],
                longTerm: ["Join a speaking club"]
            }
        }
    }
} 