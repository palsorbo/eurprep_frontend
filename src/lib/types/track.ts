import type { LucideIcon } from 'lucide-react'

export interface Track {
    id: string
    title: string
    description: string
    icon: LucideIcon
    status: 'active' | 'coming-soon' | 'locked'
    color: string
    bgColor: string
    topicsCount: number
    estimatedTime: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    category: string
    tags: string[]
    createdAt: string
    updatedAt: string
}

export interface Topic {
    id: string
    title: string
    category: string
    description: string
    trackId: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number // in seconds
    tags: string[]
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface UserTrackProgress {
    userId: string
    trackId: string
    completedTopics: number
    totalTopics: number
    totalPracticeTime: number // in seconds
    averageScore: number
    lastPracticeDate: string | null
    streakDays: number
    achievements: string[]
    createdAt: string
    updatedAt: string
}

export interface TrackStats {
    totalUsers: number
    totalRecordings: number
    averageCompletionRate: number
    averageScore: number
    popularTopics: string[]
}

export type TrackStatus = 'active' | 'coming-soon' | 'locked'
export type TrackDifficulty = 'beginner' | 'intermediate' | 'advanced' 