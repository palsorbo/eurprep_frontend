import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

export interface Recording {
    id: string
    user_id: string
    track_id: string
    topic_id?: string
    duration_seconds: number
    audio_url?: string
    feedback_data?: any
    created_at: string
    updated_at: string
}

export interface UseRecordingsReturn {
    recordings: Recording[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    addRecording: (recording: Omit<Recording, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
    deleteRecording: (id: string) => Promise<void>
}

export function useRecordings(): UseRecordingsReturn {
    const { user } = useAuth()
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRecordings = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('recordings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (fetchError) {
                throw fetchError
            }

            setRecordings(data || [])
        } catch (err) {
            console.error('Error fetching recordings:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch recordings')
        } finally {
            setLoading(false)
        }
    }

    const addRecording = async (recording: Omit<Recording, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) return

        try {
            const { data, error: insertError } = await supabase
                .from('recordings')
                .insert({
                    ...recording,
                    user_id: user.id
                })
                .select()
                .single()

            if (insertError) {
                throw insertError
            }

            setRecordings(prev => [data, ...prev])
        } catch (err) {
            console.error('Error adding recording:', err)
            throw err
        }
    }

    const deleteRecording = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('recordings')
                .delete()
                .eq('id', id)

            if (deleteError) {
                throw deleteError
            }

            setRecordings(prev => prev.filter(recording => recording.id !== id))
        } catch (err) {
            console.error('Error deleting recording:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchRecordings()
    }, [user])

    return {
        recordings,
        loading,
        error,
        refetch: fetchRecordings,
        addRecording,
        deleteRecording
    }
} 