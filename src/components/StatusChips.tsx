import { useState, useEffect } from 'react'
import { Wifi, WifiOff, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { checkBackendAvailability } from '../lib/api'
import { useCredits } from '../hooks/useCredits'

export default function StatusChips() {
    const { balance, loading: creditsLoading } = useCredits()
    const [backendStatus, setBackendStatus] = useState<'pending' | 'success' | 'error'>('pending')

    useEffect(() => {
        const checkBackend = async () => {
            try {
                const isAvailable = await checkBackendAvailability()
                setBackendStatus(isAvailable ? 'success' : 'error')
            } catch {
                setBackendStatus('error')
            }
        }

        checkBackend()
    }, [])

    const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="h-4 w-4 text-gray-400" />
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />
        }
    }

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {/* Credit Status */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                    {creditsLoading ? 'Loading...' : `${balance} credit${balance !== 1 ? 's' : ''}`}
                </span>
                {!creditsLoading && balance <= 0 && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                )}
            </div>

            {/* Backend Status */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                {backendStatus === 'error' ? (
                    <WifiOff className="h-4 w-4 text-red-500" />
                ) : (
                    <Wifi className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-700">
                    {backendStatus === 'pending' ? 'Checking...' :
                        backendStatus === 'success' ? 'Analysis ready' : 'Service unavailable'}
                </span>
                {getStatusIcon(backendStatus)}
            </div>
        </div>
    )
}
