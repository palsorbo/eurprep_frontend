import { useAuth } from '../lib/auth-context'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/app/login" replace />
    }

    return <>{children}</>
} 