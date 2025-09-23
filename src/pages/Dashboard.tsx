

import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { Play } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/', { replace: true, state: { from: 'dashboard' } })
        }
    }, [user, authLoading, navigate])


    if (authLoading) {
        return (
            <LoadingScreen
                message="Loading your dashboard..."
                size="lg"
            />
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Ready to Ace Your Banking Interview?
                    </h2>
                    <p className="text-slate-600 text-lg">
                    Choose your preparation path for SBI PO or IBPS PO and start practicing with smart-powered mock interviews.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* SBI PO Card */}
                    <Link
                        to="/sbi-po"
                        className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300"
                    >
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                        <div className="w-6 h-6 text-gray-400">🏦</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                            SBI PO
                        </h3>
                        <p className="text-slate-600 text-sm">
                        SBI Probationary Officer preparation with smart-powered interview sets and instant feedback. Available now!
                        </p>
                        <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                            <span>Start Preparation</span>
                            <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    {/* Coming Soon Card */}
                    <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                            <div className="w-6 h-6 text-gray-400">🏦</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            IBPS PO
                        </h3>
                        <p className="text-slate-600 text-sm">
                        IBPS Probationary Officer preparation with comprehensive interview sets and smart feedback. Launching soon!
                        </p>
                        <div className="mt-4 text-gray-500 text-sm font-medium">
                            Coming Soon
                        </div>
                    </div>

                    {/* Coming Soon Card */}
                {/* <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                            <div className="w-6 h-6 text-blue-400">🎓</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            MBA
                        </h3>
                        <p className="text-slate-600 text-sm">
                            MBA interview preparation with case studies, group discussions, and personal interviews.
                        </p>
                        <div className="mt-4 text-gray-500 text-sm font-medium">
                            Coming Soon
                        </div>
                </div> */}
            </div>
        </div>
    )
} 