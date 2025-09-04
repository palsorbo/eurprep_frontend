import { useAuth } from '../lib/auth-context'
import { Navigate } from 'react-router-dom'
import Login from '../pages/Login'

export default function AuthRedirect() {
    const { user, loading } = useAuth()

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
            </div>
        )
    }

    // If user is authenticated, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    // If user is not authenticated, show login page
    return <Login />
}
