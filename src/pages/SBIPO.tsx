import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { usePayment } from '../lib/payment-context'
import { BookOpen, Play, CheckCircle, Lock, History, Eye, Calendar } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import PaymentModal from '../components/PaymentModal'
import { PRICING } from '../constants/pricing'
import { supabase } from '../lib/supabase'

interface FeedbackHistory {
    id: string
    session_id: string
    interview_set: string
    version: string
    feedback_data: any
    overall_feedback: any
    created_at: string
}

export default function SBIPO() {
    const { user, loading: authLoading } = useAuth()
    const { hasPaidAccess, isLoading: paymentLoading } = usePayment()
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const navigate = useNavigate()

    // Load feedback history
    const loadFeedbackHistory = async () => {
        if (!user) return

        setIsLoadingHistory(true)
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL
            const response = await fetch(`${baseUrl}/api/v1/feedback/user/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setFeedbackHistory(data.feedback)
                }
            }
        } catch (error) {
            console.error('Error loading feedback history:', error)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/', { replace: true, state: { from: 'sbi-po' } })
        } else if (user) {
            loadFeedbackHistory()
        }
    }, [user, authLoading, navigate])

    if (authLoading || paymentLoading) {
        return (
            <LoadingScreen
                message="Loading SBI PO dashboard..."
                size="lg"
            />
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    SBI PO Smart Interview Prep
                </h2>
                <p className="text-slate-600 text-lg">
                    Master your SBI Probationary Officer interview with smart-powered practice sessions and instant feedback.
                </p>
            </div>

            {/* Interview Sets */}
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                    Interview Sets
                </h3>
                <p className="text-slate-600 text-center mb-8">
                    Choose an interview set to practice with structured questions and get smart feedback on your performance.
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
                                <span className="text-xs font-medium">Free Demo</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                            Set 1
                        </h3>
                        <p className="text-slate-600 text-sm mb-4">
                            Comprehensive interview set with 10 banking-specific questions covering personal, HR, and technical aspects. Get smart feedback on each answer.
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

                    {/* Premium Bundle Banner */}
                    {!hasPaidAccess && (
                        <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200 mb-6">
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                                        Unlock Premium Bundle
                                    </h3>
                                    <p className="text-green-700">
                                        Get access to Set 2 & 3 with advanced questions, expert-level scenarios, and smart feedback
                                    </p>
                                    <div className="mt-2 text-2xl font-bold text-green-800">
                                        ₹{PRICING.SBI_PO_PREMIUM_BUNDLE.AMOUNT} <span className="text-sm font-normal text-green-700">{PRICING.SBI_PO_PREMIUM_BUNDLE.TYPE}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <span>Unlock Premium</span>
                                    <Lock className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Set 2 Card */}
                    {hasPaidAccess ? (
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
                                Advanced interview questions focusing on economic awareness, customer handling, and leadership scenarios with smart analysis.
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
                    ) : (
                        <div className="group bg-white/50 rounded-lg shadow-sm p-6 border border-slate-200 cursor-not-allowed">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg">
                                    <Lock className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                Set 2
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Advanced interview questions focusing on economic awareness, customer handling, and leadership scenarios.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400">
                                    10 Questions
                                </div>
                                <div className="flex items-center text-slate-400 text-sm">
                                    <span>Premium Content</span>
                                    <Lock className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Set 3 Card */}
                    {hasPaidAccess ? (
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
                                Expert-level questions on banking operations, Basel norms, and complex situational scenarios with detailed smart feedback.
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
                    ) : (
                        <div className="group bg-white/50 rounded-lg shadow-sm p-6 border border-slate-200 cursor-not-allowed">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg">
                                    <Lock className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                Set 3
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Expert-level questions on banking operations, Basel norms, and complex situational scenarios.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400">
                                    10 Questions
                                </div>
                                <div className="flex items-center text-slate-400 text-sm">
                                    <span>Premium Content</span>
                                    <Lock className="w-4 h-4 ml-2" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback History Section */}
            {feedbackHistory.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        Your Interview History
                    </h3>
                    <p className="text-slate-600 text-center mb-8">
                        Review your previous interview sessions and feedback.
                    </p>

                    <div className="max-w-4xl mx-auto">
                        {isLoadingHistory ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading your interview history...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedbackHistory.map((feedback) => (
                                    <div key={feedback.id} className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                                    <History className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-slate-900">
                                                        {feedback.interview_set} Interview
                                                    </h4>
                                                    <p className="text-sm text-slate-600">
                                                        Version {feedback.version}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center text-slate-500 text-sm mb-1">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(feedback.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(feedback.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700">Overall Score</span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {feedback.overall_feedback?.averageScore?.toFixed(1) || 'N/A'}/10
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${((feedback.overall_feedback?.averageScore || 0) / 10) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-sm text-slate-700 mb-2">
                                                <span className="font-medium">Summary:</span> {feedback.overall_feedback?.summary || 'No summary available'}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-slate-700">Recommendation:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${feedback.overall_feedback?.recommendation === 'Recommended'
                                                    ? 'text-green-600 bg-green-100'
                                                    : feedback.overall_feedback?.recommendation === 'Recommended with improvements'
                                                        ? 'text-yellow-600 bg-yellow-100'
                                                        : 'text-red-600 bg-red-100'
                                                    }`}>
                                                    {feedback.overall_feedback?.recommendation || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-slate-500">
                                                {feedback.feedback_data?.qa_feedback?.length || 0} Questions Answered
                                            </div>
                                            <Link
                                                to={`/sbi-po/results/${feedback.session_id}`}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Detailed Results
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    // Handle successful payment
                    console.log('Payment successful')
                }}
            />

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
                            Practice group discussion and collaborative exercises for SBI PO preparation.
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
                            Assess your personality traits and behavioral patterns for SBI PO selection.
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