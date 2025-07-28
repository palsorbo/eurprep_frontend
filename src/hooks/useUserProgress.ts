import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

            const { data, error: fetchError } = await supabase
                .from('user_track_progress')
                .select('*')
                .eq('user_id', user.id)

            if (fetchError) {
                throw fetchError
            }

            // Convert array to record
            const progressRecord: Record<string, UserTrackProgress> = {}
            data?.forEach(item => {
                progressRecord[item.track_id] = item
            })

            setProgress(progressRecord)
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

            if (existingProgress) {
                // Update existing progress
                const { data, error: updateError } = await supabase
                    .from('user_track_progress')
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('track_id', trackId)
                    .select()
                    .single()

                if (updateError) {
                    throw updateError
                }

                setProgress(prev => ({
                    ...prev,
                    [trackId]: data
                }))
            } else {
                // Create new progress
                const { data, error: insertError } = await supabase
                    .from('user_track_progress')
                    .insert({
                        user_id: user.id,
                        track_id: trackId,
                        completed_topics: 0,
                        total_topics: 0,
                        total_practice_time: 0,
                        average_score: 0,
                        last_practice_date: null,
                        streak_days: 0,
                        achievements: [],
                        ...updates
                    })
                    .select()
                    .single()

                if (insertError) {
                    throw insertError
                }

                setProgress(prev => ({
                    ...prev,
                    [trackId]: data
                }))
            }
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