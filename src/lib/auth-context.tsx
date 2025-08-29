import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state change:', event, 'session:', session?.user?.id)
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                // Handle sign out explicitly
                if (event === 'SIGNED_OUT') {
                    console.log('User signed out, clearing state')
                    setUser(null)
                    setSession(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        console.log('AuthContext signOut called')
        try {
            console.log('Calling supabase.auth.signOut()...')
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Supabase signOut error:', error)
                throw error
            }
            console.log('Supabase signOut successful')
        } catch (error) {
            console.error('Error in signOut:', error)
            throw error
        }
    }

    const value = {
        user,
        session,
        loading,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 