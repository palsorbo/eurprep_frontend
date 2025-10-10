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
            <section className="relative px-4 sm:px-6 py-16 sm:py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
                        Master Banking
                        <br />
                        <span className="text-sky-600">Interviews</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                        Transform your interview skills with intelligent practice sessions. Get instant feedback and build genuine confidence for SBI PO and IBPS PO success.
                    </p>

                    {/* Main CTA */}
                    <div className="mb-12 mt-8">
                        {/* Email Authentication Section - Now Primary */}
                        <div className="w-full max-w-[400px] mx-auto">
                            {!emailSent ? (
                                <>
                                    <div className="mb-6">
                                        <label htmlFor="email-input" className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email-input"
                                            type="email"
                                            value={email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            placeholder="your.email@example.com"
                                            className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 text-lg ${email && !isEmailValid
                                                ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                                : 'border-slate-300 hover:border-slate-400 focus:bg-white'
                                                }`}
                                            disabled={emailLoading}
                                        />
                                        {email && !isEmailValid && (
                                            <div className="flex items-center mt-2 text-red-600">
                                                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm">Please enter a valid email address</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleEmailAuth()}
                                        disabled={emailLoading || !isEmailValid}
                                        className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        {emailLoading ? (
                                            <>
                                                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-3"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-5 h-5 mr-3" />
                                                Continue with Email
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-4 text-sm text-gray-500 text-center">
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
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                                                Enter Verification Code
                                            </label>
                                            <div className="flex gap-2 justify-center">
                                                {Array.from({ length: 6 }, (_, index) => (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        maxLength={1}
                                                        value={otp[index] || ''}
                                                        aria-label={`Digit ${index + 1} of 6`}
                                                        aria-describedby="otp-help"
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            if (value || e.target.value === '') {
                                                                const newOtp = otp.split('');
                                                                newOtp[index] = value;
                                                                const updatedOtp = newOtp.join('').slice(0, 6);
                                                                setOtp(updatedOtp);

                                                            // Auto-focus next input
                                                            if (value && index < 5) {
                                                                const nextInput = e.target.nextElementSibling as HTMLInputElement;
                                                                if (nextInput) nextInput.focus();
                                                            }
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                            const target = e.target as HTMLInputElement;
                                                            const prevInput = target.previousElementSibling as HTMLInputElement;
                                                            if (prevInput) {
                                                                prevInput.focus();
                                                                const newOtp = otp.split('');
                                                                newOtp[index - 1] = '';
                                                                setOtp(newOtp.join(''));
                                                            }
                                                        }
                                                    }}
                                                    className="w-12 h-12 text-center text-xl font-semibold border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    disabled={verifyingOtp}
                                                />
                                            ))}
                                            </div>
                                            {otp.length === 0 && (
                                                <p className="text-sm text-gray-500 text-center mt-2">Enter the 6-digit code from your email</p>
                                            )}
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

                        {/* OR Divider */}
                        <div className="mt-8 flex items-center justify-center">
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1"></div>
                            <span className="mx-4 px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-sm rounded-full border border-slate-200">
                                OR
                            </span>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1"></div>
                        </div>

                        {/* Google OAuth - Secondary Option */}
                        <div className="mt-6">
                            <button
                                onClick={handleGoogleAuth}
                                disabled={loading}
                                className="bg-white border-2 border-slate-200 text-slate-800 px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-slate-400 hover:shadow-lg transition-all duration-300 font-medium text-lg flex items-center justify-center mx-auto group shadow-md transform hover:-translate-y-1 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[280px] focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mr-3"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" style={{ minWidth: '20px' }}>
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="whitespace-nowrap flex items-center">Continue with Google</span>
                                    </>
                                )}
                            </button>
                            {/* <p className="text-xs text-gray-500 mt-3 text-center">
                                For development/testing purposes only
                            </p> */}
                        </div>

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
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl max-w-lg mx-auto shadow-sm">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium text-red-800 mb-1">
                                        Authentication Error
                                    </h3>
                                    <p className="text-sm text-red-700 leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                    <button
                                        onClick={() => setError('')}
                                        className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md p-1"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
