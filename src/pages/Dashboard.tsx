

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { LogOut } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import Logo from '../components/Logo'

export default function Dashboard() {
    const { user, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        console.log('Dashboard useEffect - user:', user, 'authLoading:', authLoading)
        if (!authLoading && !user) {
            console.log('User not authenticated, navigating to home...')
            navigate('/', { replace: true, state: { from: 'dashboard' } })
        }
    }, [user, authLoading, navigate])

    const handleLogout = async () => {
        console.log('Logout button clicked')
        try {
            console.log('Calling signOut...')
            await signOut()
            console.log('signOut completed, navigating to home...')
            navigate('/', { replace: true, state: { from: 'logout' } })
            console.log('Navigation completed')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/', { replace: true, state: { from: 'logout_error' } })
        }
    }

    if (authLoading) {
        return (
            <LoadingScreen
                message="Loading your dashboard..."
                size="lg"
            />
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Logo size="lg" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-slate-700">
                                Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Welcome to Eurprep
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Your dashboard is ready. More features coming soon!
                    </p>
                </div>
            </div>
        </div>
    )
} 