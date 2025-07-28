'use client'

import { COLORS } from '../lib/constants/colors'

interface LinearProgressBarProps {
    progress: number // 0-100
    color?: string // Tailwind color class
    height?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    label?: string
    className?: string
}

export default function LinearProgressBar({
    progress,
    color = COLORS.secondary.emerald[500],
    height = 'md',
    showLabel = false,
    label,
    className = ''
}: LinearProgressBarProps) {
    const heightClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    }

    const clampedProgress = Math.min(Math.max(progress, 0), 100)

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                        {label || 'Progress'}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                        {Math.round(clampedProgress)}%
                    </span>
                </div>
            )}

            <div className={`w-full bg-slate-200 rounded-full ${heightClasses[height]} overflow-hidden`}>
                <div
                    className={`${color} ${heightClasses[height]} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    )
} 