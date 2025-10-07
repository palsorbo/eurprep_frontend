

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
                    Land Your Dream Banking Job
                </h2>
                <p className="text-slate-600 text-lg">
                    Get interview-ready with intelligent mock interviews that build your confidence and perfect your responses for SBI PO and IBPS PO exams.
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
                        Build confidence and ace your SBI PO interview with intelligent practice sessions that deliver instant, personalized evaluation.
                    </p>
                    <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                        <span>Start Preparation</span>
                        <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* IBPS PO Card */}
                <Link
                    to="/ibps-po"
                    className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-blue-300"
                >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                        <div className="w-6 h-6 text-gray-400">🏦</div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        IBPS PO
                    </h3>
                    <p className="text-slate-600 text-sm">
                        Build confidence and ace your IBPS PO interview with intelligent practice sessions that deliver instant, personalized evaluation.
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        <span>Start Preparation</span>
                        <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

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
