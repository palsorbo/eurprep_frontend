interface LoadingScreenProps {
    message?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export default function LoadingScreen({
    message = 'Preparing your interview session...',
    size = 'lg',
    className = ''
}: LoadingScreenProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center ${className}`}>
            <div className="text-center">
                <div className="mb-6">
                    <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-sky-600 mx-auto`}></div>
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
