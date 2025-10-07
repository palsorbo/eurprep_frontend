import { useEffect, useState, lazy, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { usePayment } from '../lib/payment-context'
import { History, Eye, Calendar, Lock } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import InterviewSetCard from '../components/InterviewSetCard'
import { getIbpsPoSets } from '../constants/interviewSets'
import { PRICING } from '../constants/pricing'
import { getAttemptCounts } from '../services/attemptService'

// Lazy load PaymentModal
const PaymentModal = lazy(() => import('../components/PaymentModal'))

interface FeedbackHistory {
    id: string
    interview_session_id: string
    interview_type: string
    interview_set: string
    version: string
    feedback_data: any
    overall_feedback: any
    created_at: string
}

export default function IBPSPO() {
    const { user, loading: authLoading } = useAuth()
    const { hasAccessToProduct, isLoading: paymentLoading } = usePayment()
    const hasPaidAccess = hasAccessToProduct('ibps_po_premium_bundle')
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [attemptCounts, setAttemptCounts] = useState<{ [key: string]: number }>({})
    const navigate = useNavigate()

    // Load feedback history
    const loadFeedbackHistory = async () => {
        if (!user) return

        setIsLoadingHistory(true)
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL
            // Use more RESTful POST endpoint for database-level filtering
            const response = await fetch(`${baseUrl}/api/v1/feedback/filtered`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    interviewType: 'ibps-po'
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setFeedbackHistory(data.feedback)
                }
            }
        } catch (error) {
        } finally {
            setIsLoadingHistory(false)
        }
    }

    // Load attempt counts
    const loadAttemptCounts = async () => {
        if (!user) return

        try {
            const counts = await getAttemptCounts(user.id, 'ibps-po')
            setAttemptCounts(counts)
        } catch (error) {
            console.error('Error loading attempt counts:', error)
        }
    }

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/', { replace: true, state: { from: 'ibps-po' } })
        } else if (user) {
            loadFeedbackHistory()
            loadAttemptCounts()
        }
    }, [user, authLoading, navigate])

    if (authLoading || paymentLoading) {
        return (
            <LoadingScreen
                message="Loading IBPS PO dashboard..."
                size="lg"
            />
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Enhanced Hero Section */}
            <div className="text-center mb-12">
                {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                </div> */}
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    Ace Your
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> IBPS PO </span>
                    Interview
                </h1>
                <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
                    Transform your interview skills with intelligent practice sessions that deliver personalized evaluation and build genuine confidence.
                </p>

                {/* Stats Section */}
                {/* <div className="flex flex-wrap justify-center gap-8 mt-8">
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700">AI-Powered Evaluation</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700">Real-time Feedback</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-700">Expert Questions</span>
                    </div>
                </div> */}
            </div>

            {/* Interview Sets Section */}
            <div className="mb-16">
                {/* <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Choose Your Practice Level
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Start with our free demo and unlock premium sets to access advanced scenarios and expert-level evaluation.
                    </p>
                </div> */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">


                    {/* Interview Set Cards */}
                    {getIbpsPoSets(hasPaidAccess).map((set) => {
                        const setKey = `Set${set.id}`
                        const attemptCount = attemptCounts[setKey] || 0

                        return (
                            <InterviewSetCard
                                key={set.id}
                                set={{
                                    ...set,
                                    attemptCount,
                                    maxAttempts: 2,
                                    isAttemptLimitReached: attemptCount >= 2
                                }}
                                onUpgrade={!hasPaidAccess ? () => setIsPaymentModalOpen(true) : undefined}
                            />
                        )
                    })}

                    {/* Enhanced Premium Bundle Banner */}
                    {!hasPaidAccess && (
                        <div className="md:col-span-2 lg:col-span-3 relative overflow-hidden">
                            {/* Background with enhanced gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10"></div>

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

                            {/* Limited Time Badge */}
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                                🔥 LIMITED OFFER!
                            </div>

                            <div className="relative p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="mb-8 md:mb-0 text-center md:text-left flex-1">
                                        <div className="flex items-center justify-center md:justify-start mb-4">
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl mr-4 shadow-lg">
                                                <Lock className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-bold text-blue-800 mb-1">
                                                    Unlock Premium Bundle
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-blue-600 text-sm font-medium">Most Popular Choice</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-blue-700 text-lg mb-6 leading-relaxed max-w-lg">
                                            Unlock your full potential with <span className="font-bold text-blue-800">complete interview mastery</span> - advanced scenarios, expert-level evaluation, and personalized feedback that builds real confidence
                                        </p>

                                        {/* Enhanced Feature Highlights */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                            <div className="flex items-center bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-200/50">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                                <span className="text-blue-800 text-sm font-semibold">3 Complete Sets</span>
                                            </div>
                                            <div className="flex items-center bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-200/50">
                                                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                                                <span className="text-blue-800 text-sm font-semibold">Expert Evaluation</span>
                                            </div>
                                            <div className="flex items-center bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-200/50">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                                <span className="text-blue-800 text-sm font-semibold">Smart Analysis</span>
                                            </div>
                                        </div>

                                        {/* Enhanced Pricing Section */}
                                        <div className="flex items-center justify-center md:justify-start space-x-4">
                                            <div className="text-center">
                                                <div className="text-lg text-blue-600 line-through font-medium">
                                                    ₹{PRICING.IBPS_PO_PREMIUM_BUNDLE.ORIGINAL_AMOUNT}
                                                </div>
                                                <div className="text-xs text-blue-500">Original Price</div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-px h-8 bg-blue-400"></div>
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold text-blue-800">
                                                        ₹{PRICING.IBPS_PO_PREMIUM_BUNDLE.AMOUNT}
                                                    </div>
                                                    <div className="text-sm text-blue-600 font-medium">Limited Time Offer</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center md:ml-8">
                                        <button
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 px-10 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-3 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mb-4 group"
                                        >
                                            <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            <span>Unlock Premium</span>
                                        </button>
                                        <div className="space-y-1">
                                            <p className="text-blue-600 text-sm font-semibold">
                                                ✅ Instant Access
                                            </p>
                                            <p className="text-blue-600 text-sm font-semibold">
                                                ✅ No Hidden Fees
                                            </p>
                                            <p className="text-blue-600 text-sm font-semibold">
                                                ✅ 30-Day Money Back
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Feedback History Section */}
            {feedbackHistory.length > 0 && (
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6">
                            <History className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Your Interview Journey
                        </h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Track your progress and see how your interview skills have evolved over time.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        {isLoadingHistory ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                                <p className="text-slate-600 font-medium">Loading your interview history...</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {feedbackHistory.map((feedback, index) => {
                                    const score = feedback.overall_feedback?.averageScore || 0
                                    const recommendation = feedback.overall_feedback?.recommendation || 'N/A'

                                    return (
                                        <div key={feedback.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden">
                                            <div className="p-8">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                                                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                                                            <History className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                                {feedback.interview_set} Interview
                                                            </h3>
                                                            <p className="text-slate-600 font-medium">
                                                                Version {feedback.version}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center text-slate-500 text-sm mb-2">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span className="font-medium">{new Date(feedback.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {new Date(feedback.created_at).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8 mb-6">
                                                    {/* Score Section */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-lg font-bold text-slate-800">Overall Score</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-2xl font-bold text-blue-600">
                                                                        {score.toFixed(1)}
                                                                    </span>
                                                                    <span className="text-slate-500">/10</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                                                                    style={{
                                                                        width: `${(score / 10) * 100}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                            <span className="font-semibold text-slate-700">Questions Answered</span>
                                                            <span className="text-lg font-bold text-slate-900">
                                                                {feedback.feedback_data?.qa_feedback?.length || 0}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Summary Section */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 mb-2">Performance Summary</h4>
                                                            <p className="text-slate-600 leading-relaxed">
                                                                {feedback.overall_feedback?.summary || 'No summary available'}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <span className="font-semibold text-slate-700">Recommendation:</span>
                                                            <span className={`px-3 py-2 rounded-full text-sm font-bold ${recommendation === 'Recommended'
                                                                ? 'text-green-700 bg-green-100'
                                                                : recommendation === 'Recommended with improvements'
                                                                    ? 'text-yellow-700 bg-yellow-100'
                                                                    : 'text-red-700 bg-red-100'
                                                                }`}>
                                                                {recommendation}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center pt-4 border-t border-slate-100">
                                                    <Link
                                                        to={`/results/${feedback.id}`}
                                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <Eye className="w-5 h-5 mr-2" />
                                                        View Detailed Results
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <Suspense fallback={
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-slate-600 mt-4">Loading payment modal...</p>
                        </div>
                    </div>
                }>
                    <PaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        onSuccess={() => {
                            // Handle successful payment
                        }}
                        productType="ibps_po_premium_bundle"
                    />
                </Suspense>
            )}

            {/* Other Modules Coming soon*/}
            {/* <div className="mt-16">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                    Other Modules
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                            <div className="w-6 h-6 text-gray-400">👥</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Group Exercise
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Practice group discussion and collaborative exercises for IBPS PO preparation.
                        </p>
                        <div className="mt-4 text-gray-500 text-sm font-medium">
                            Coming Soon
                        </div>
                    </div>

                    <div className="group bg-white rounded-lg shadow-md p-6 border border-slate-200 opacity-60">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                            <div className="w-6 h-6 text-gray-400">🧠</div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Psychometric Test
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Assess your personality traits and behavioral patterns for IBPS PO selection.
                        </p>
                        <div className="mt-4 text-gray-500 text-sm font-medium">
                            Coming Soon
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    )
}
