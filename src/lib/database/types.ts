// Database Types for Courage App
// This file contains TypeScript interfaces that match the database schema

export interface DatabaseTopic {
    id: string
    title: string
    category: string
    description: string
    track_id: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimated_time: number // in seconds
    tags: string[]
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface JamRecording {
    id: string
    user_id: string
    topic_id: string
    storage_path: string
    duration_seconds: number
    status: 'processing' | 'analyzing' | 'completed' | 'failed'
    transcript?: string
    feedback_data?: Record<string, unknown> // JSONB field for flexible feedback structure
    overall_score?: number
    error_message?: string
    created_at: string
    updated_at: string
}

// Static track IDs that can be referenced in the database
export const TRACK_IDS = {
    JAM: 'jam',
    IBPS_PO: 'ibps-po',
    HR_FRESHERS: 'hr-freshers'
} as const

// Difficulty levels
export const DIFFICULTY_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
} as const

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS]

// Common categories for topics
export const TOPIC_CATEGORIES = {
    TECHNOLOGY: 'Technology',
    WORKPLACE: 'Workplace',
    ENVIRONMENT: 'Environment',
    ECONOMICS: 'Economics',
    HEALTH: 'Health',
    EDUCATION: 'Education',
    LIFESTYLE: 'Lifestyle',
    BANKING: 'Banking',
    INTRODUCTION: 'Introduction'
} as const

export type TopicCategory = typeof TOPIC_CATEGORIES[keyof typeof TOPIC_CATEGORIES]

// Database query result types
export interface TopicsQueryResult {
    data: DatabaseTopic[] | null
    error: any
    count: number | null
}

export interface TopicQueryResult {
    data: DatabaseTopic | null
    error: any
}

export interface JamRecordingsQueryResult {
    data: JamRecording[] | null
    error: any
    count: number | null
}

export interface JamRecordingQueryResult {
    data: JamRecording | null
    error: any
}

// Helper type for creating new topics
export interface CreateTopicData {
    title: string
    category: string
    description: string
    track_id: string
    difficulty: DifficultyLevel
    estimated_time: number
    tags: string[]
    is_active?: boolean
}

// Helper type for updating topics
export interface UpdateTopicData {
    title?: string
    category?: string
    description?: string
    track_id?: string
    difficulty?: DifficultyLevel
    estimated_time?: number
    tags?: string[]
    is_active?: boolean
}

// Helper type for creating new JAM recordings
export interface CreateJamRecordingData {
    user_id: string
    topic_id: string
    duration_seconds: number
    status?: 'processing' | 'analyzing' | 'completed' | 'failed'
}

// Helper type for updating JAM recordings
export interface UpdateJamRecordingData {
    storage_path?: string
    status?: 'processing' | 'analyzing' | 'completed' | 'failed'
    transcript?: string
    feedback_data?: Record<string, unknown>
    overall_score?: number
    error_message?: string
} 