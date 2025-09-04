

import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { LogOut, Mic, Play } from 'lucide-react'
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
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Welcome to Eurprep
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Your dashboard is ready. Choose an interview type to get started!
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* Streaming Interview Card */}
                    <Link
                        to="/streaming-interview"
                        className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300"
                    >
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                            <Mic className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                            Streaming Interview
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Real-time streaming interview with live transcription and analysis.
                        </p>
                        <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                            <span>Start Interview</span>
                            <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Coming Soon Card */}
                    <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                            <div className="w-6 h-6 text-gray-400">📊</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Analytics Dashboard
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Track your progress and performance over time with detailed analytics.
                        </p>
                        <div className="mt-4 text-gray-500 text-sm font-medium">
                            Coming Soon
                        </div>
                    </div>

                    {/* Coming Soon Card */}
                    <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                            <div className="w-6 h-6 text-blue-400">🎯</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Practice Tests
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Take practice tests and get detailed feedback on your performance.
                        </p>
                        <div className="mt-4 text-gray-500 text-sm font-medium">
                            Coming Soon
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 