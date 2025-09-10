import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { usePayment } from '../lib/payment-context'
import { BookOpen, Play, CheckCircle, Lock } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import PaymentModal from '../components/PaymentModal'
import { PRICING } from '../constants/pricing'

export default function SBIPO() {
    const { user, loading: authLoading } = useAuth()
    const { hasPaidAccess, isLoading: paymentLoading } = usePayment()
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        console.log('SBI PO useEffect - user:', user, 'authLoading:', authLoading)
        if (!authLoading && !user) {
            console.log('User not authenticated, navigating to home...')
            navigate('/', { replace: true, state: { from: 'sbi-po' } })
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
                                <span className="text-xs font-medium">Free Demo</span>
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

                    {/* Premium Bundle Banner */}
                    {!hasPaidAccess && (
                        <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200 mb-6">
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                                        Unlock Premium Bundle
                                    </h3>
                                    <p className="text-green-700">
                                        Get access to Set 2 & 3 with advanced questions and expert-level scenarios
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

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    // Handle successful payment
                    console.log('Payment successful')
                }}
            />

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
    )
}