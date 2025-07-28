import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, Clock, Target, Star, TrendingUp } from 'lucide-react'
import type { Track } from '../../lib/types/track'
import { getDifficultyColors, getCategoryColors, COLORS } from '../../lib/constants/colors'

interface TrackCardProps {
    track: Track
    userProgress?: {
        completedTopics: number
        totalTopics: number
        averageScore: number
        lastPracticeDate: string | null
    }
    showProgress?: boolean
    className?: string
}

export default function TrackCard({
    track,
    userProgress,
    showProgress = true,
    className = ''
}: TrackCardProps) {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false)

    const isActive = track.status === 'active'
    const IconComponent = track.icon

    const progressPercentage = userProgress
        ? Math.round((userProgress.completedTopics / userProgress.totalTopics) * 100)
        : 0

    const handleTrackSelect = () => {
        if (isActive) {
            navigate(`/app/tracks/${track.id}/practice`)
        }
    }

    const difficultyColors = getDifficultyColors(track.difficulty)
    const categoryColors = getCategoryColors(track.category)

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return <Star className="w-3 h-3" />
            case 'intermediate':
                return <TrendingUp className="w-3 h-3" />
            case 'advanced':
                return <Target className="w-3 h-3" />
            default:
                return <Star className="w-3 h-3" />
        }
    }

    // Determine card styling based on status
    const getCardStyling = () => {
        if (isActive) {
            // Special styling for JAM track
            if (track.id === 'jam') {
                return `bg-white rounded-xl shadow-lg border-2 border-yellow-400 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer relative overflow-hidden`
            }
            return `bg-white rounded-xl shadow-sm border ${COLORS.neutral.slate.border} p-6 transition-all duration-200 ${COLORS.neutral.slate.borderHover} hover:shadow-md hover:scale-[1.02] cursor-pointer`
        } else {
            return `bg-white rounded-xl shadow-sm border ${COLORS.comingSoon.border} p-6 transition-all duration-200 hover:shadow-sm cursor-not-allowed opacity-60`
        }
    }

    // Determine icon styling based on status
    const getIconStyling = () => {
        if (isActive) {
            return `w-12 h-12 ${track.bgColor} rounded-lg flex items-center justify-center transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`
        } else {
            return `w-12 h-12 ${COLORS.comingSoon.bg} rounded-lg flex items-center justify-center transition-transform duration-200`
        }
    }

    return (
        <div
            className={`${getCardStyling()} ${className}`}
            onClick={handleTrackSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Special background pattern for JAM */}
            {track.id === 'jam' && isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-30 pointer-events-none" />
            )}
            {/* Header with Icon and Status */}
            <div className="flex items-start justify-between mb-4">
                <div className={getIconStyling()}>
                    <IconComponent className={`w-6 h-6 ${isActive ? track.color : COLORS.comingSoon.icon}`} />
                </div>

                <div className="flex items-center space-x-2">
                    {/* Featured Badge for JAM */}
                    {track.id === 'jam' && isActive && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                            FEATURED
                        </span>
                    )}
                    {!isActive && (
                        <Lock className="w-5 h-5 text-gray-400" />
                    )}
                    {isActive && track.id !== 'jam' && (
                        <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                    )}
                    {isActive && track.id === 'jam' && (
                        <ArrowRight className={`w-4 h-4 text-yellow-600 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                    )}
                </div>
            </div>

            {/* Track Info */}
            <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`text-lg font-semibold ${isActive ? 'text-slate-900' : COLORS.comingSoon.text}`}>
                        {track.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${difficultyColors.bg} ${difficultyColors.text}`}>
                        {getDifficultyIcon(track.difficulty)}
                        <span className="capitalize">{track.difficulty}</span>
                    </span>
                </div>

                <p className={`text-sm leading-relaxed mb-3 ${isActive ? 'text-gray-600' : COLORS.comingSoon.text}`}>
                    {track.description}
                </p>

                {/* Category Badge with Icon */}
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 ${categoryColors.bg} ${categoryColors.text} text-xs font-medium rounded-full flex items-center space-x-1`}>
                        <IconComponent className="w-3 h-3" />
                        <span>{track.category}</span>
                    </span>
                </div>
            </div>

            {/* Progress Bar (if enabled and user has progress) */}
            {showProgress && userProgress && isActive && (
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span className={COLORS.primary.yellow.progressText}>
                            {userProgress.completedTopics}/{userProgress.totalTopics} topics
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`${COLORS.primary.yellow.progress} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{progressPercentage}% complete</span>
                        {userProgress.averageScore > 0 && (
                            <span>Avg: {userProgress.averageScore.toFixed(1)}/10</span>
                        )}
                    </div>
                </div>
            )}

            {/* Track Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span className={COLORS.primary.yellow.progressText}>{track.topicsCount} topics</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{track.estimatedTime}</span>
                    </div>
                </div>
            </div>

            {/* Coming Soon Badge */}
            {!isActive && (
                <div className={`mt-4 p-3 ${COLORS.comingSoon.bg} rounded-lg border ${COLORS.comingSoon.border}`}>
                    <p className={`text-sm ${COLORS.comingSoon.text} text-center font-medium`}>
                        Coming Soon
                    </p>
                    <p className={`text-xs ${COLORS.comingSoon.text} text-center mt-1 opacity-75`}>
                        We&apos;re working on this track
                    </p>
                </div>
            )}

            {/* Last Practice Info */}
            {userProgress?.lastPracticeDate && isActive && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Last practiced: {new Date(userProgress.lastPracticeDate).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    )
} 