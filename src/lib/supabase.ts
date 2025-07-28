import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
export const clearSessionAndRedirect = async (redirectUrl: string = '/login') => {
    await supabase.auth.signOut()
    // Clear any stored session data
    if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
    }
    window.location.href = redirectUrl
} 