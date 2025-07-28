import { COLORS } from '../lib/constants/colors'

interface CircularProgressProps {
    value: number
    max: number
    size?: 'sm' | 'md' | 'lg'
    showValue?: boolean
    label?: string
    className?: string
}

export default function CircularProgress({
    value,
    max,
    size = 'md',
    showValue = true,
    label,
    className = ''
}: CircularProgressProps) {
    const percentage = Math.min((value / max) * 100, 100)
    const radius = size === 'sm' ? 20 : size === 'lg' ? 40 : 30
    const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 6 : 4
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-20 h-20',
        lg: 'w-24 h-24'
    }

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    // Convert Tailwind classes to hex colors for SVG
    const getColorFromClass = (className: string) => {
        const colorMap: Record<string, string> = {
            'bg-slate-200': '#e2e8f0',
            'bg-yellow-400': '#fbbf24',
            'text-yellow-600': '#d97706'
        }
        return colorMap[className] || '#000000'
    }

    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <svg
                className="w-full h-full transform -rotate-90"
                viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
            >
                {/* Background circle */}
                <circle
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    stroke={getColorFromClass(COLORS.neutral.slate[200])}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={radius + strokeWidth}
                    cy={radius + strokeWidth}
                    r={radius}
                    stroke={getColorFromClass(COLORS.primary.yellow.progress)}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showValue && (
                    <span className={`font-bold ${textSizeClasses[size]} ${COLORS.primary.yellow.progressText}`}>
                        {value.toFixed(1)}
                    </span>
                )}
                {label && (
                    <span className={`text-xs ${COLORS.neutral.slate.textMuted} mt-1`}>
                        {label}
                    </span>
                )}
            </div>
        </div>
    )
} 