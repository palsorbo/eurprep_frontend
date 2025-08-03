import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'

export interface Recording {
    id: string
    user_id: string
    track_id: string
    topic_id?: string
    duration_seconds: number
    audio_url?: string
    feedback_data?: unknown
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

            // Use localStorage instead of Supabase
            const storageKey = `recordings_${user.id}`
            const storedRecordings = localStorage.getItem(storageKey)
            const recordings = storedRecordings ? JSON.parse(storedRecordings) : []

            setRecordings(recordings)
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
            const newRecording: Recording = {
                id: `local-${Date.now()}`,
                user_id: user.id,
                track_id: recording.track_id,
                topic_id: recording.topic_id,
                duration_seconds: recording.duration_seconds,
                audio_url: recording.audio_url,
                feedback_data: recording.feedback_data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            const updatedRecordings = [newRecording, ...recordings]
            setRecordings(updatedRecordings)

            // Save to localStorage
            const storageKey = `recordings_${user.id}`
            localStorage.setItem(storageKey, JSON.stringify(updatedRecordings))
        } catch (err) {
            console.error('Error adding recording:', err)
            throw err
        }
    }

    const deleteRecording = async (id: string) => {
        try {
            const updatedRecordings = recordings.filter(recording => recording.id !== id)
            setRecordings(updatedRecordings)

            // Save to localStorage
            if (user) {
                const storageKey = `recordings_${user.id}`
                localStorage.setItem(storageKey, JSON.stringify(updatedRecordings))
            }
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