import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import type { UserTrackProgress } from '../lib/types/track'

export interface UseUserProgressReturn {
    progress: Record<string, UserTrackProgress>
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    updateProgress: (trackId: string, updates: Partial<UserTrackProgress>) => Promise<void>
    getProgress: (trackId: string) => UserTrackProgress | null
}

export function useUserProgress(): UseUserProgressReturn {
    const { user } = useAuth()
    const [progress, setProgress] = useState<Record<string, UserTrackProgress>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProgress = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            // Use localStorage instead of Supabase
            const storageKey = `user_progress_${user.id}`
            const storedProgress = localStorage.getItem(storageKey)
            const progressData = storedProgress ? JSON.parse(storedProgress) : {}

            setProgress(progressData)
        } catch (err) {
            console.error('Error fetching user progress:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch user progress')
        } finally {
            setLoading(false)
        }
    }

    const updateProgress = async (trackId: string, updates: Partial<UserTrackProgress>) => {
        if (!user) return

        try {
            const existingProgress = progress[trackId]
            const updatedProgress = {
                ...existingProgress,
                ...updates,
                updated_at: new Date().toISOString()
            }

            const newProgress = {
                ...progress,
                [trackId]: updatedProgress
            }

            setProgress(newProgress)

            // Save to localStorage
            const storageKey = `user_progress_${user.id}`
            localStorage.setItem(storageKey, JSON.stringify(newProgress))
        } catch (err) {
            console.error('Error updating user progress:', err)
            throw err
        }
    }

    const getProgress = (trackId: string): UserTrackProgress | null => {
        return progress[trackId] || null
    }

    useEffect(() => {
        fetchProgress()
    }, [user])

    return {
        progress,
        loading,
        error,
        refetch: fetchProgress,
        updateProgress,
        getProgress
    }
} 