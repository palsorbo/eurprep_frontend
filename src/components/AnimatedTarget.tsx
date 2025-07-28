import { Target } from 'lucide-react'

interface AnimatedTargetProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'loading' | 'progress' | 'success'
    progress?: number // 0-100 for progress variant
    className?: string
}

export default function AnimatedTarget({
    size = 'md',
    variant = 'loading',
    progress = 0,
    className = ''
}: AnimatedTargetProps) {
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48'
    }

    const iconSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    }

    if (variant === 'progress') {
        return (
            <div className={`relative ${sizeClasses[size]} ${className}`}>
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-slate-200"></div>

                {/* Progress circle */}
                <div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 transition-all duration-500 ease-out"
                    style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + (progress / 100) * 50}% 0%, ${50 + (progress / 100) * 50}% 50%)`
                    }}
                ></div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Target className={`${iconSizes[size]} text-white drop-shadow-sm`} />
                </div>

                {/* Progress text */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-slate-700">
                    {Math.round(progress)}%
                </div>
            </div>
        )
    }

    if (variant === 'success') {
        return (
            <div className={`relative ${sizeClasses[size]} ${className}`}>
                {/* Success animation rings */}
                <div className="absolute inset-0 rounded-full bg-green-500 target-ring-expand opacity-75"></div>
                <div className="absolute inset-2 rounded-full bg-green-400 target-ring-expand opacity-50" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-4 rounded-full bg-green-300 target-ring-expand opacity-25" style={{ animationDelay: '0.4s' }}></div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Target className={`${iconSizes[size]} text-white drop-shadow-sm`} />
                </div>
            </div>
        )
    }

    // Default loading variant
    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Expanding rings animation */}
            <div className="absolute inset-0 rounded-full border-2 border-sky-500 target-ring-expand opacity-75"></div>
            <div className="absolute inset-2 rounded-full border-2 border-sky-400 target-ring-expand opacity-50" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute inset-4 rounded-full border-2 border-sky-300 target-ring-expand opacity-25" style={{ animationDelay: '0.6s' }}></div>

            {/* Center target icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg p-2 shadow-lg loading-target">
                    <Target className={`${iconSizes[size]} text-white`} />
                </div>
            </div>
        </div>
    )
} 