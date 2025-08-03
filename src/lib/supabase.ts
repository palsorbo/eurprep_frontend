import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://txadftcpmqoqxvrrkqlc.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4YWRmdGNwbXFvcXh2cnJrcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTY1NzIsImV4cCI6MjA2MzkzMjU3Mn0.vYokGCoxreN7OVe4slkiMkquoYznMS6Mob3u_S9ug3E"

if (!supabaseUrl) {
    throw new Error('Missing environment variable: VITE_SUPABASE_URL')
}

if (!supabaseAnonKey) {
    throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Database types
export interface Profile {
    id: string
    full_name: string
    avatar_url?: string
    created_at: string
}

export interface Recording {
    id: string
    user_id: string
    storage_path: string
    duration_seconds?: number
    transcript?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    created_at: string
}

export interface Feedback {
    id: string
    recording_id: string
    user_id: string
    feedback_data: Record<string, unknown> // JSONB field for flexible feedback structure
    created_at: string
}

// Utility function to clear session and force fresh login
export const clearSessionAndRedirect = async (redirectUrl: string = '/app/login') => {
    await supabase.auth.signOut()
    // Clear any stored session data
    if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
    }
    window.location.href = redirectUrl
}