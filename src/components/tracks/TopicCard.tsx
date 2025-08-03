'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Clock, Star, TrendingUp, Zap } from 'lucide-react'
import type { Topic } from '../../lib/types/track'
import { getDifficultyColors } from '../../lib/constants/colors'

interface TopicCardProps {
    topic: Topic
    onSelect?: (topic: Topic) => void
    isSelected?: boolean
    className?: string
    trackId?: string
    navigateToTopic?: boolean
}

export default function TopicCard({
    topic,
    onSelect,
    isSelected = false,
    className = '',
    trackId,
    navigateToTopic = false
}: TopicCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const navigate = useNavigate()

    const difficultyColors = getDifficultyColors(topic.difficulty)

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return <Star className="w-3 h-3" />
            case 'intermediate':
                return <TrendingUp className="w-3 h-3" />
            case 'advanced':
                return <Zap className="w-3 h-3" />
            default:
                return <Star className="w-3 h-3" />
        }
    }

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-200 cursor-pointer ${isSelected
                ? 'ring-2 ring-sky-500 border-sky-500 shadow-md'
                : 'hover:border-slate-300 hover:shadow-md'
                } ${className}`}
            onClick={() => {
                if (navigateToTopic && trackId) {
                    navigate(`/app/tracks/${trackId}/practice/${topic.id}`)
                } else if (onSelect) {
                    onSelect(topic)
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header with Category and Difficulty */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                        {topic.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${difficultyColors.bg} ${difficultyColors.text}`}>
                        {getDifficultyIcon(topic.difficulty)}
                        <span className="capitalize">{topic.difficulty}</span>
                    </span>
                </div>
                <Target className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isHovered ? 'scale-110' : ''
                    }`} />
            </div>

            {/* Topic Title and Description */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {topic.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    {topic.description}
                </p>
            </div>

            {/* Tags */}
            {topic.tags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {topic.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-sky-50 text-sky-700 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {topic.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                                +{topic.tags.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer with Time */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{Math.round(topic.estimatedTime / 60)} min</span>
                </div>

                {isSelected && (
                    <div className="flex items-center space-x-1 text-blue-600 text-sm font-medium">
                        <span>Selected</span>
                    </div>
                )}
            </div>
        </div>
    )
} 