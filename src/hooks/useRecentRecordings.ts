import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { getJamRecordings } from '../lib/database'
import type { JamRecording } from '../lib/database/types'

export function useRecentRecordings(limit: number = 5) {
    const { user } = useAuth()
    const [recordings, setRecordings] = useState<JamRecording[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecentRecordings = async () => {
            if (!user?.id) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)

                const result = await getJamRecordings(user.id)

                if (result.error) {
                    setError(result.error.message || 'Failed to fetch recordings')
                    return
                }

                if (result.data) {
                    // Sort by created_at descending and limit
                    const sortedRecordings = result.data
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, limit)

                    setRecordings(sortedRecordings)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch recordings')
            } finally {
                setLoading(false)
            }
        }

        fetchRecentRecordings()
    }, [user?.id, limit])

    return { recordings, loading, error }
} 