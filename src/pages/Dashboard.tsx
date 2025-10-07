

import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { Play, Target, Landmark } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/', { replace: true, state: { from: 'dashboard' } })
        }
    }, [user, authLoading, navigate])

    // const getMotivationalMessage = (firstName: string) => {
    //     const messages = [
    //         `Great work, ${firstName}! Let's build more confidence`,
    //         `${firstName}, you're making excellent progress!`,
    //         `Welcome back, ${firstName}! Ready for more practice?`,
    //         `${firstName}, your interview skills are improving!`,
    //         `Keep it up, ${firstName}! Every session counts`
    //     ]
    //     return messages[Math.floor(Math.random() * messages.length)]
    // }

    if (authLoading) {
        return (
            <LoadingScreen
                message="Loading your dashboard..."
                size="lg"
            />
        )
    }

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Candidate'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Enhanced Hero Section */}
            <div className="text-center mb-12">
                {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-100 to-sky-200 rounded-3xl mb-8">
                    <Target className="w-10 h-10 text-sky-600" />
                </div> */}
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    Welcome,
                    <span className="bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent"> {firstName}</span>
                </h1>
                {/* <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed mb-8">
                    {getMotivationalMessage(firstName)}
                </p> */}
            </div>

            {/* Enhanced Feature Cards Section */}
            <div className="mb-16">
                {/* <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Choose Your Exam Preparation
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Select your target exam and start practicing with our AI-powered interview system
                    </p>
                </div> */}

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Enhanced SBI PO Card */}
                    <Link
                        to="/sbi-po"
                        className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200 hover:border-green-300 overflow-hidden relative"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-lg group-hover:scale-110">
                                    <Landmark className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-green-700">Most Popular</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors">
                                SBI PO Interview
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Master the SBI PO interview with comprehensive practice sessions and expert evaluation.
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-green-600 text-lg font-bold group-hover:text-green-700 transition-colors">
                                    <span>Start Preparation</span>
                                    <Play className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
                                </div>
                                <div className="text-sm text-slate-500">
                                    Premium sets available
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Enhanced IBPS PO Card */}
                    <Link
                        to="/ibps-po"
                        className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200 hover:border-blue-300 overflow-hidden relative"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-12 translate-x-12"></div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-lg group-hover:scale-110">
                                    <Landmark className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-blue-700">Comprehensive</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                IBPS PO Interview
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Excel in IBPS PO interview with adaptive practice and intelligent feedback system.
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-blue-600 text-lg font-bold group-hover:text-blue-700 transition-colors">
                                    <span>Start Preparation</span>
                                    <Play className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
                                </div>
                                <div className="text-sm text-slate-500">
                                    Premium sets available
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                    Ready to Start?
                </h3>
                <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">
                    Begin your interview preparation journey with our free demo sets and experience smart, personalized evaluation.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/sbi-po"
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Try SBI PO Demo
                    </Link>
                    <Link
                        to="/ibps-po"
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Try IBPS PO Demo
                    </Link>
                </div>
            </div>
        </div>
    )
}
