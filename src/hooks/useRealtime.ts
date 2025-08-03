import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

export interface UseRealtimeOptions {
    table: string
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    filter?: string
    callback?: (payload: unknown) => void
}

export function useRealtime(options: UseRealtimeOptions) {
    const { user } = useAuth()
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    useEffect(() => {
        if (!user) return

        const { table, event = '*', filter, callback } = options

        // Create the subscription using the correct Supabase v2 syntax
        const channel = supabase
            .channel(`${table}_changes`)
            .on(
                'postgres_changes' as any,
                {
                    event,
                    schema: 'public',
                    table,
                    filter: filter ? `user_id=eq.${user.id}` : undefined
                },
                (payload: unknown) => {
                    console.log(`Realtime ${event} on ${table}:`, payload)
                    callback?.(payload)
                }
            )
            .subscribe()

        channelRef.current = channel

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, [user, options.table, options.event, options.filter, options.callback])

    return {
        channel: channelRef.current
    }
}

// Specific hooks for common use cases
export function useRecordingsRealtime(callback?: (payload: unknown) => void) {
    return useRealtime({
        table: 'recordings',
        event: '*',
        callback
    })
}

export function useProgressRealtime(callback?: (payload: unknown) => void) {
    return useRealtime({
        table: 'user_track_progress',
        event: '*',
        callback
    })
} 