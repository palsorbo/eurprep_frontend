import AnimatedTarget from './AnimatedTarget'

interface LoadingScreenProps {
    message?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export default function LoadingScreen({
    message = 'Loading...',
    size = 'lg',
    className = ''
}: LoadingScreenProps) {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center ${className}`}>
            <div className="text-center">
                <div className="mb-6">
                    <AnimatedTarget size={size} variant="loading" />
                </div>
                <p className="text-slate-600 text-lg font-medium">{message}</p>
                <div className="mt-4 flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    )
} 