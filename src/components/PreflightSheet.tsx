import { useState, useEffect } from 'react'
import { X, Mic, MicOff, Wifi, WifiOff, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { checkBackendAvailability } from '../lib/api'
import { useCredits } from '../hooks/useCredits'

interface PreflightSheetProps {
    isOpen: boolean
    onClose: () => void
    onStart: () => void
}

type CheckStatus = 'pending' | 'success' | 'error'

interface CheckState {
    mic: CheckStatus
    backend: CheckStatus
    credits: CheckStatus
}

export default function PreflightSheet({ isOpen, onClose, onStart }: PreflightSheetProps) {
    const { balance, loading: creditsLoading } = useCredits()
    const [checks, setChecks] = useState<CheckState>({
        mic: 'pending',
        backend: 'pending',
        credits: 'pending'
    })
    const [isChecking, setIsChecking] = useState(false)
    const [dontShowAgain, setDontShowAgain] = useState(false)

    // Run checks when sheet opens
    useEffect(() => {
        if (!isOpen) return

        const runChecks = async () => {
            setIsChecking(true)
            setChecks({ mic: 'pending', backend: 'pending', credits: 'pending' })

            // Check backend availability
            try {
                const backendOk = await checkBackendAvailability()
                setChecks(prev => ({ ...prev, backend: backendOk ? 'success' : 'error' }))
            } catch {
                setChecks(prev => ({ ...prev, backend: 'error' }))
            }

            // Check mic permission (probe only)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                stream.getTracks().forEach(track => track.stop())
                setChecks(prev => ({ ...prev, mic: 'success' }))
            } catch {
                setChecks(prev => ({ ...prev, mic: 'error' }))
            }

            // Check credits
            if (!creditsLoading) {
                setChecks(prev => ({
                    ...prev,
                    credits: balance > 0 ? 'success' : 'error'
                }))
            }

            setIsChecking(false)
        }

        runChecks()
    }, [isOpen, balance, creditsLoading])

    const canStart = checks.mic === 'success' && checks.backend === 'success' && checks.credits === 'success'

    const handleStart = async () => {
        if (!canStart) return

        // Save user preference
        if (dontShowAgain) {
            localStorage.setItem('jamPreflightAckV1', JSON.stringify({
                timestamp: Date.now(),
                expiresAt: Date.now() + (14 * 24 * 60 * 60 * 1000) // 14 days
            }))
        }

        onStart()
        onClose()
    }

    const getStatusIcon = (status: CheckStatus) => {
        switch (status) {
            case 'pending':
                return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />
        }
    }

    const getStatusText = (status: CheckStatus) => {
        switch (status) {
            case 'pending':
                return 'Checking...'
            case 'success':
                return 'Ready'
            case 'error':
                return 'Issue detected'
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white rounded-t-lg sm:rounded-lg shadow-xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Before You Start</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 text-sm">
                        Let's make sure everything is ready for your JAM session.
                    </p>

                    {/* Checks */}
                    <div className="space-y-3">
                        {/* Mic Check */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {checks.mic === 'error' ? (
                                    <MicOff className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Mic className="h-5 w-5 text-gray-600" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">Microphone</p>
                                    <p className="text-sm text-gray-500">
                                        {checks.mic === 'error'
                                            ? 'Permission needed'
                                            : 'Access to record audio'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${checks.mic === 'success' ? 'text-green-600' :
                                        checks.mic === 'error' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                    {getStatusText(checks.mic)}
                                </span>
                                {getStatusIcon(checks.mic)}
                            </div>
                        </div>

                        {/* Backend Check */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {checks.backend === 'error' ? (
                                    <WifiOff className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Wifi className="h-5 w-5 text-gray-600" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">Analysis Service</p>
                                    <p className="text-sm text-gray-500">
                                        {checks.backend === 'error'
                                            ? 'Service unavailable'
                                            : 'AI feedback available'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${checks.backend === 'success' ? 'text-green-600' :
                                        checks.backend === 'error' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                    {getStatusText(checks.backend)}
                                </span>
                                {getStatusIcon(checks.backend)}
                            </div>
                        </div>

                        {/* Credits Check */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <CreditCard className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Credits</p>
                                    <p className="text-sm text-gray-500">
                                        {checks.credits === 'error'
                                            ? 'Insufficient credits'
                                            : `${balance} credit${balance !== 1 ? 's' : ''} available`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${checks.credits === 'success' ? 'text-green-600' :
                                        checks.credits === 'error' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                    {getStatusText(checks.credits)}
                                </span>
                                {getStatusIcon(checks.credits)}
                            </div>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {checks.mic === 'error' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                                Please allow microphone access in your browser settings to record your JAM session.
                            </p>
                        </div>
                    )}

                    {checks.credits === 'error' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 mb-2">
                                You need at least 1 credit to analyze your recording.
                            </p>
                            <button
                                onClick={() => window.location.href = '/app/buy-credits'}
                                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            >
                                Buy Credits
                            </button>
                        </div>
                    )}

                    {checks.backend === 'error' && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                                Analysis service is temporarily unavailable. You can still record, but feedback may be limited.
                            </p>
                        </div>
                    )}

                    {/* Don't show again */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="dont-show-again"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="dont-show-again" className="text-sm text-gray-600">
                            Don't show this again for 14 days
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        disabled={!canStart || isChecking}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isChecking ? 'Checking...' : 'Start Recording'}
                    </button>
                </div>
            </div>
        </div>
    )
}
