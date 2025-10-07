import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Link, Hash } from 'lucide-react'

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [emailLoading, setEmailLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [showEmailOptions, setShowEmailOptions] = useState(false)
    const [isEmailValid, setIsEmailValid] = useState(false)
    const [otp, setOtp] = useState('')
    const [verifyingOtp, setVerifyingOtp] = useState(false)

    const handleGoogleAuth = async () => {
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            })

            if (error) {
                setError(error.message)
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleEmailAuth = async () => {
        if (!email) {
            setError('Please enter your email address')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        setEmailLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    shouldCreateUser: true,
                }
            })

            if (error) {
                setError(error.message)
            } else {
                setEmailSent(true)
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setEmailLoading(false)
        }
    }



    // Real-time email validation
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleEmailChange = (value: string) => {
        setEmail(value)
        setIsEmailValid(validateEmail(value))
    }

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit code')
            return
        }

        setVerifyingOtp(true)
        setError('')

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            })

            if (error) {
                setError(error.message)
            } else {
                // Success - user will be redirected via AuthCallback component
                window.location.href = '/dashboard'
            }
        } catch {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setVerifyingOtp(false)
        }
    }

    const resetOtpFlow = () => {
        setOtp('')
        setEmailSent(false)
        setEmail('')
        setError('')
        setIsEmailValid(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Ace Your Banking
                        <br />
                        <span className="text-sky-600">Interview</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Smart-powered practice with instant feedback. Master SBI PO and IBPS PO interviews with real banking questions.
                    </p>

                    {/* Main CTA */}
                    <div className="mb-12 mt-8">
                        <button
                            onClick={handleGoogleAuth}
                            disabled={loading}
                            className="bg-white border-2 border-slate-300 text-slate-700 px-10 py-5 rounded-xl hover:bg-slate-50 hover:border-blue-400 transition-all duration-300 font-bold text-xl flex items-center justify-center mx-auto group shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[280px]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mr-3"></div>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 mr-3 flex-shrink-0" viewBox="0 0 24 24" style={{ minWidth: '24px' }}>
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="whitespace-nowrap flex items-center">Continue with Google</span>
                                </>
                            )}
                        </button>

                        {/* OR Divider */}
                        <div className="mt-6 flex items-center justify-center">
                            <div className="flex items-center space-x-4">
                                <div className="h-px bg-slate-300 flex-1"></div>
                                <span className="text-slate-500 font-medium text-sm px-3">OR</span>
                                <div className="h-px bg-slate-300 flex-1"></div>
                            </div>
                        </div>

                        {/* Progressive Disclosure Toggle */}
                        {!showEmailOptions && (
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowEmailOptions(true)}
                                    className="text-slate-600 hover:text-slate-800 font-medium text-lg underline-offset-4 hover:underline transition-colors"
                                >
                                    Continue with Email
                                </button>
                            </div>
                        )}

                        {/* Email Authentication Section */}
                        {showEmailOptions && (
                            <div className="mt-8 w-full max-w-[280px] mx-auto">
                                {!emailSent ? (
                                    <>
                                        <div className="mb-4">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                placeholder="Enter your email address"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 text-lg ${email && !isEmailValid
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-300'
                                                    }`}
                                                disabled={emailLoading}
                                            />
                                            {email && !isEmailValid && (
                                                <p className="text-red-600 text-sm mt-1">Please enter a valid email address</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleEmailAuth()}
                                            disabled={emailLoading || !isEmailValid}
                                            className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed w-full"
                                        >
                                            {emailLoading ? (
                                                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                            ) : (
                                                <Mail className="w-5 h-5 mr-2" />
                                            )}
                                            Continue using Email
                                        </button>

                                        <div className="mt-3 text-sm text-gray-500 text-center">
                                            <p>We'll send you an email with a link and verification code. Use either method to sign in securely.</p>
                                        </div>
                                    </>
                                ) : (
                                    /* Combined Success Section - Shows both options */
                                    <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                                        <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                                            Check Your Email
                                        </h3>
                                        <p className="text-green-700 mb-4">
                                            We've sent an email to {email} with:
                                        </p>

                                        <div className="bg-white rounded-lg p-4 mb-4 text-left">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <Link className="w-5 h-5 text-sky-600" />
                                                <span className="font-medium text-gray-800">Option 1: Click the link</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Hash className="w-5 h-5 text-emerald-600" />
                                                <span className="font-medium text-gray-800">Option 2: Enter the 6-digit code below</span>
                                            </div>
                                        </div>

                                        {/* OTP Input Field */}
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="Enter OTP"
                                                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-lg text-center font-mono tracking-widest"
                                                disabled={verifyingOtp}
                                                maxLength={6}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={handleVerifyOtp}
                                                disabled={verifyingOtp || otp.length !== 6}
                                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold text-lg flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                                            >
                                                {verifyingOtp ? (
                                                    <>
                                                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    'Verify Code'
                                                )}
                                            </button>

                                            <button
                                                onClick={resetOtpFlow}
                                                className="w-full text-green-600 hover:text-green-700 font-medium text-sm"
                                            >
                                                Use different email
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
                            By continuing, you agree to our{' '}
                            <a href="#" className="text-slate-700 hover:text-slate-900 underline font-medium">
                                Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-slate-700 hover:text-slate-900 underline font-medium">
                                Terms of Service
                            </a>
                        </p> */}
                    </div>

                    {/* Trust Builders */}
                    {/* <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>10+ Banking Aspirants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-green-600 font-semibold">✓ 95% Interview Success Rate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>⚡ Instant Smart Feedback</span>
                        </div>
                    </div> */}

                    {/* Privacy Assurance */}
                    {/* <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-2xl mx-auto">
                        <div className="flex items-center justify-center space-x-2 text-slate-700 mb-2">
                            <Lock className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">Privacy First</span>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            We'll never share your data. Your practice sessions are completely private.
                        </p>
                    </div> */}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                            <p className="text-red-700 text-sm text-center">{error}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
