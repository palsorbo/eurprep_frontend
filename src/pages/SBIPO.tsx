import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { LogOut, ArrowLeft, BookOpen, Play, CheckCircle } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import Logo from '../components/Logo'

export default function SBIPO() {
    const { user, loading: authLoading, signOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        console.log('SBI PO useEffect - user:', user, 'authLoading:', authLoading)
        if (!authLoading && !user) {
            console.log('User not authenticated, navigating to home...')
            navigate('/', { replace: true, state: { from: 'sbi-po' } })
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
                message="Loading SBI PO dashboard..."
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
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        SBI PO Preparation
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Choose a module to start your SBI Probationary Officer preparation.
                    </p>
                </div>

                {/* Interview Sets */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        Interview Sets
                    </h3>
                    <p className="text-slate-600 text-center mb-8">
                        Choose an interview set to practice with structured questions.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Set 1 Card */}
                        <Link
                            to="/sbi-po/interview/1"
                            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Available</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                                Set 1
                            </h3>
                            <p className="text-slate-600 text-sm mb-4">
                                Comprehensive interview set with 10 banking-specific questions covering personal, HR, and technical aspects.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    10 Questions
                                </div>
                                <div className="flex items-center text-green-600 text-sm font-medium">
                                    <span>Start Set</span>
                                    <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Set 2 Card */}
                        <Link
                            to="/sbi-po/interview/2"
                            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Available</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                                Set 2
                            </h3>
                            <p className="text-slate-600 text-sm mb-4">
                                Advanced interview questions focusing on economic awareness, customer handling, and leadership scenarios.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    10 Questions
                                </div>
                                <div className="flex items-center text-green-600 text-sm font-medium">
                                    <span>Start Set</span>
                                    <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Set 3 Card */}
                        <Link
                            to="/sbi-po/interview/3"
                            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Available</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                                Set 3
                            </h3>
                            <p className="text-slate-600 text-sm mb-4">
                                Expert-level questions on banking operations, Basel norms, and complex situational scenarios.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    10 Questions
                                </div>
                                <div className="flex items-center text-green-600 text-sm font-medium">
                                    <span>Start Set</span>
                                    <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Other Modules */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        Other Modules
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Coming Soon Card */}
                        <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                                <div className="w-6 h-6 text-gray-400">👥</div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                Group Exercise
                            </h3>
                            <p className="text-slate-600 text-sm">
                                Practice group discussion and collaborative exercises for SBI PO preparation.
                            </p>
                            <div className="mt-4 text-gray-500 text-sm font-medium">
                                Coming Soon
                            </div>
                        </div>

                        {/* Coming Soon Card */}
                        <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                                <div className="w-6 h-6 text-gray-400">🧠</div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                Psychometric Test
                            </h3>
                            <p className="text-slate-600 text-sm">
                                Assess your personality traits and behavioral patterns for SBI PO selection.
                            </p>
                            <div className="mt-4 text-gray-500 text-sm font-medium">
                                Coming Soon
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
