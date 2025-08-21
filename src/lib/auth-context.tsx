import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getApiUrl, getAuthHeaders } from './config'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
    isFirstTimeUser: boolean
    freeCreditsGiven: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
    const [freeCreditsGiven, setFreeCreditsGiven] = useState(false)

    // Function to handle first-time user and give free credits
    const handleFirstTimeUser = async (userId: string) => {
        try {
            // Check localStorage first as a fallback
            const localStorageKey = `freeCreditsGiven_${userId}`;
            const hasReceivedCredits = localStorage.getItem(localStorageKey);

            if (hasReceivedCredits === 'true') {
                setIsFirstTimeUser(false);
                setFreeCreditsGiven(true);
                return;
            }

            // Check if user already has credits record
            const { data: existingCredits, error } = await supabase
                .from('user_credits')
                .select('free_credits_given, balance')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking credits:', error);
                return;
            }

            // If no record exists or free credits not given, this is a first-time user
            if (!existingCredits || !existingCredits.free_credits_given) {
                setIsFirstTimeUser(true);

                // Call backend API to give free credits
                const response = await fetch(getApiUrl('/api/v1/credits/give-free-credits'), {
                    method: 'POST',
                    headers: getAuthHeaders(session?.access_token || '')
                });

                if (response.ok) {
                    const result = await response.json();
                    setFreeCreditsGiven(true);

                    // Mark as received in localStorage
                    localStorage.setItem(localStorageKey, 'true');

                    // Show success message to user
                    if (typeof window !== 'undefined') {
                        window.alert('🎉 Welcome! You\'ve received 10 free credits to explore the app!');
                    }
                } else {
                    console.error('Failed to give free credits:', response.status);
                }
            } else {
                setIsFirstTimeUser(false);
                setFreeCreditsGiven(true);

                // Mark as received in localStorage
                localStorage.setItem(localStorageKey, 'true');
            }
        } catch (error) {
            console.error('Error handling first-time user:', error);
        }
    };

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)

            // Check first-time user status if session exists
            if (session?.user) {
                await handleFirstTimeUser(session.user.id);
            }
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                // Handle first-time user when they sign in
                if (event === 'SIGNED_IN' && session?.user) {
                    await handleFirstTimeUser(session.user.id);
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setIsFirstTimeUser(false)
        setFreeCreditsGiven(false)
    }

    const value = {
        user,
        session,
        loading,
        signOut,
        isFirstTimeUser,
        freeCreditsGiven
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