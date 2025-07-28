import { useState, useEffect } from 'react'
import { Target, Zap } from 'lucide-react'

interface AnimatedScoreProps {
    score: number
    maxScore?: number
    size?: 'sm' | 'md' | 'lg'
    showDetails?: boolean
}

export default function AnimatedScore({
    score,
    maxScore = 10,
    size = 'md',
    showDetails = true
}: AnimatedScoreProps) {
    const [displayScore, setDisplayScore] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
        const duration = 2000 // 2 seconds
        const steps = 60 // 60 steps for smooth animation
        const increment = score / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= score) {
                setDisplayScore(score)
                clearInterval(timer)
            } else {
                setDisplayScore(Math.floor(current * 10) / 10)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [score])

    const percentage = (score / maxScore) * 100
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600'
        if (score >= 6) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBg = (score: number) => {
        if (score >= 8) return 'bg-green-100'
        if (score >= 6) return 'bg-yellow-100'
        return 'bg-red-100'
    }

    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-6xl'
    }

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    return (
        <div className="text-center">
            {isVisible && (
                <div className="flex flex-col items-center space-y-4">
                    {/* Score Display */}
                    <div className="relative">
                        <div className={`font-bold ${sizeClasses[size]} ${getScoreColor(score)}`}>
                            {displayScore.toFixed(1)}
                        </div>
                        <div className="text-gray-500 text-sm">
                            / {maxScore}
                        </div>
                    </div>

                    {/* Progress Circle */}
                    <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className={`${getScoreColor(score)}`}
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: `${(percentage / 100) * 251.2} 251.2`
                                }}
                            />
                        </svg>

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div>
                                {percentage >= 80 ? (
                                    <Target className={`${iconSizes[size]} text-green-600`} />
                                ) : (
                                    <Zap className={`${iconSizes[size]} text-yellow-600`} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score Label */}
                    {showDetails && (
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${getScoreBg(score)} ${getScoreColor(score)}`}>
                            {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 