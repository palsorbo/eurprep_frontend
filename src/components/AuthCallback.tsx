import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the session from the URL hash/fragment
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth callback error:', error)
                    navigate('/app/login?error=auth_failed')
                    return
                }

                if (session) {
                    navigate('/app', { replace: true })
                } else {
                    navigate('/app/login', { replace: true })
                }
            } catch (error) {
                console.error('Unexpected error in auth callback:', error)
                navigate('/app/login?error=unexpected')
            }
        }

        handleAuthCallback()
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Completing authentication...</p>
            </div>
        </div>
    )
}
