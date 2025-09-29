import { useEffect, useState, lazy, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { usePayment } from '../lib/payment-context'
import { History, Eye, Calendar, Lock } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import InterviewSetCard from '../components/InterviewSetCard'
import { getIbpsPoSets } from '../constants/interviewSets'
import { PRICING } from '../constants/pricing'

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

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/', { replace: true, state: { from: 'ibps-po' } })
        } else if (user) {
            loadFeedbackHistory()
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
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    IBPS PO Smart Interview Prep
                </h2>
                <p className="text-slate-600 text-lg">
                    Master your IBPS Probationary Officer interview with smart-powered practice sessions and instant feedback.
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


                    {/* Interview Set Cards */}
                    {getIbpsPoSets(hasPaidAccess).map((set) => (
                        <InterviewSetCard
                            key={set.id}
                            set={set}
                            onUpgrade={!hasPaidAccess ? () => setIsPaymentModalOpen(true) : undefined}
                        />
                    ))}

                    {/* Premium Bundle Banner */}
                    {!hasPaidAccess && (
                        <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200 mb-6">
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                                        Unlock Premium Bundle
                                    </h3>
                                    <p className="text-blue-700">
                                        Get access to Set 2 & 3 plus all future question sets with advanced questions, expert-level scenarios, and smart feedback
                                    </p>
                                    <div className="mt-2 text-2xl font-bold text-blue-800">
                                        ₹{PRICING.IBPS_PO_PREMIUM_BUNDLE.AMOUNT} <span className="text-sm font-normal text-blue-700">{PRICING.IBPS_PO_PREMIUM_BUNDLE.TYPE}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <span>Unlock Premium</span>
                                    <Lock className="w-4 h-4" />
                                </button>
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
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                                                <span className="text-lg font-bold text-blue-600">
                                                    {feedback.overall_feedback?.averageScore?.toFixed(1) || 'N/A'}/10
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
                                                to={`/results/${feedback.id}`}
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
