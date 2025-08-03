

import { Circle, Star, Zap, Target, TrendingUp } from 'lucide-react'

interface SkillProgressProps {
    skill: string
    score: number
    maxScore?: number
    masteryLevel?: 'beginner' | 'intermediate' | 'advanced' | 'mastered'
    showIcon?: boolean
}

export default function SkillProgress({
    skill,
    score,
    maxScore = 10,
    masteryLevel,
    showIcon = true
}: SkillProgressProps) {
    const percentage = (score / maxScore) * 100

    const getMasteryLevel = (score: number): 'beginner' | 'intermediate' | 'advanced' | 'mastered' => {
        if (score >= 9) return 'mastered'
        if (score >= 7) return 'advanced'
        if (score >= 5) return 'intermediate'
        return 'beginner'
    }

    const currentLevel = masteryLevel || getMasteryLevel(score)

    const getLevelConfig = (level: string) => {
        switch (level) {
            case 'mastered':
                return {
                    bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
                    text: 'text-emerald-700',
                    icon: 'text-emerald-600',
                    progress: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
                    border: 'border-emerald-200',
                    card: 'bg-gradient-to-r from-emerald-50 to-teal-50',
                    iconComponent: <Star className="w-5 h-5" />
                }
            case 'advanced':
                return {
                    bg: 'bg-gradient-to-r from-blue-500 to-purple-600',
                    text: 'text-blue-700',
                    icon: 'text-blue-600',
                    progress: 'bg-gradient-to-r from-blue-400 to-purple-600',
                    border: 'border-blue-200',
                    card: 'bg-gradient-to-r from-blue-50 to-purple-50',
                    iconComponent: <Zap className="w-5 h-5" />
                }
            case 'intermediate':
                return {
                    bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
                    text: 'text-amber-700',
                    icon: 'text-amber-600',
                    progress: 'bg-gradient-to-r from-amber-400 to-orange-600',
                    border: 'border-amber-200',
                    card: 'bg-gradient-to-r from-amber-50 to-orange-50',
                    iconComponent: <Target className="w-5 h-5" />
                }
            case 'beginner':
                return {
                    bg: 'bg-gradient-to-r from-red-500 to-pink-600',
                    text: 'text-red-700',
                    icon: 'text-red-600',
                    progress: 'bg-gradient-to-r from-red-400 to-pink-600',
                    border: 'border-red-200',
                    card: 'bg-gradient-to-r from-red-50 to-pink-50',
                    iconComponent: <TrendingUp className="w-5 h-5" />
                }
            default:
                return {
                    bg: 'bg-gradient-to-r from-slate-500 to-gray-600',
                    text: 'text-slate-700',
                    icon: 'text-slate-600',
                    progress: 'bg-gradient-to-r from-slate-400 to-gray-600',
                    border: 'border-slate-200',
                    card: 'bg-gradient-to-r from-slate-50 to-gray-50',
                    iconComponent: <Circle className="w-5 h-5" />
                }
        }
    }

    const config = getLevelConfig(currentLevel)

    return (
        <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
            {showIcon && (
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    {config.iconComponent}
                </div>
            )}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-slate-900 capitalize">{skill.replace(/_/g, ' ')}</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-slate-900">{score}/{maxScore}</span>
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {currentLevel}
                        </div>
                    </div>
                </div>
                <div className="relative w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    {/* Progress bar */}
                    <div
                        className={`h-2 rounded-full ${config.progress} relative z-10`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-700 font-medium capitalize">
                        {currentLevel} level
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                        {percentage.toFixed(0)}% complete
                    </span>
                </div>
            </div>
        </div>
    )
} 