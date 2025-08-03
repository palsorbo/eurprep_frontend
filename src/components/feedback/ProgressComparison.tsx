

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ProgressComparisonProps {
    currentScore: number
    previousScore?: number
    improvementAreas?: string[]
    date?: string
}

export default function ProgressComparison({
    currentScore,
    previousScore,
    improvementAreas = [],
    date
}: ProgressComparisonProps) {
    const scoreDifference = previousScore ? currentScore - previousScore : 0
    const hasImproved = scoreDifference > 0
    const hasDeclined = scoreDifference < 0

    const getTrendIcon = () => {
        if (hasImproved) return <TrendingUp className="w-4 h-4 text-green-600" />
        if (hasDeclined) return <TrendingDown className="w-4 h-4 text-red-600" />
        return <Minus className="w-4 h-4 text-gray-600" />
    }

    const getTrendText = () => {
        if (hasImproved) return `+${scoreDifference.toFixed(1)} points`
        if (hasDeclined) return `${scoreDifference.toFixed(1)} points`
        return 'No change'
    }

    const getTrendColor = () => {
        if (hasImproved) return 'text-green-600'
        if (hasDeclined) return 'text-red-600'
        return 'text-gray-600'
    }

    return (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900">Progress Overview</h4>
                {date && <span className="text-sm text-gray-600">{date}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{currentScore.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">Current Score</div>
                </div>
                
                {previousScore && (
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-700">{previousScore.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Previous Score</div>
                    </div>
                )}
            </div>

            {previousScore && (
                <div className="flex items-center justify-center space-x-2 mb-3">
                    {getTrendIcon()}
                    <span className={`text-sm font-medium ${getTrendColor()}`}>
                        {getTrendText()}
                    </span>
                </div>
            )}

            {improvementAreas.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                    <h5 className="text-sm font-medium text-slate-900 mb-2">Areas of Improvement</h5>
                    <div className="space-y-1">
                        {improvementAreas.slice(0, 3).map((area, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-slate-700">{area}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!previousScore && (
                <div className="text-center text-sm text-gray-600">
                    This is your first attempt. Keep practicing to see your progress!
                </div>
            )}
        </div>
    )
} 