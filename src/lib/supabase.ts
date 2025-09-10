import { createClient } from '@supabase/supabase-js'

// Lazy-load environment variables to avoid issues in production builds
const getSupabaseConfig = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Check if variables are actually set (not empty strings)
    if (!supabaseUrl || supabaseUrl === '') {
        console.error('VITE_SUPABASE_URL is not set or is empty')
        throw new Error('Missing environment variable: VITE_SUPABASE_URL')
    }

    if (!supabaseAnonKey || supabaseAnonKey === '') {
        console.error('VITE_SUPABASE_ANON_KEY is not set or is empty')
        throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')
    }

    return { supabaseUrl, supabaseAnonKey }
}

export const supabase = createClient(
    getSupabaseConfig().supabaseUrl,
    getSupabaseConfig().supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storageKey: 'eurprep.auth.token',
            storage: window.localStorage,
            flowType: 'pkce',
            debug: false 
        }
    }
)

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

export interface Payment {
    id: string
    user_id: string
    amount: number
    currency: string
    razorpay_order_id: string
    razorpay_payment_id?: string
    status: 'pending' | 'completed' | 'failed'
    created_at: string
    updated_at: string
}

