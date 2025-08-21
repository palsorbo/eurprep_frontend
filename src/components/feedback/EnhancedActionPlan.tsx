import { useState, useMemo } from 'react'
import { Check, Play, Target, TrendingUp, Clock, Zap, Star, ChevronRight } from 'lucide-react'
import type { GrammarlyHighlight, FeedbackResponse } from '../../lib/config'

interface EnhancedActionPlanProps {
    feedbackData: FeedbackResponse
    onJumpToHighlight?: (highlight: GrammarlyHighlight) => void
    onPlayAudio?: () => void
}

interface ActionItem {
    id: string
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    difficulty: 'easy' | 'medium' | 'hard'
    category: 'fluency' | 'vocabulary' | 'grammar' | 'coherence' | 'time_management'
    relatedHighlights: GrammarlyHighlight[]
    practiceInstructions: string[]
    estimatedTime: string
    completed: boolean
}

export default function EnhancedActionPlan({
    feedbackData,
    onJumpToHighlight,
    onPlayAudio
}: EnhancedActionPlanProps) {
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    // Generate smart action items based on highlights and analysis
    const actionItems = useMemo((): ActionItem[] => {
        const items: ActionItem[] = []
        const highlights = feedbackData.grammarly_highlights || []

        // Group highlights by type
        const fillerWords = highlights.filter(h => h.type === 'filler_word')
        const weakPhrases = highlights.filter(h => h.type === 'weak_phrase')
        const pronunciationIssues = highlights.filter(h => h.type === 'pronunciation_issue')

        // High Impact: Filler Words (if significant)
        if (fillerWords.length >= 3) {
            const mostCommon = fillerWords.reduce((acc, curr) => {
                acc[curr.text] = (acc[curr.text] || 0) + 1
                return acc
            }, {} as Record<string, number>)

            const topFiller = Object.entries(mostCommon)
                .sort(([, a], [, b]) => b - a)[0]

            if (topFiller) {
                items.push({
                    id: 'reduce-filler-words',
                    title: `Eliminate "${topFiller[0]}" (appears ${topFiller[1]} times)`,
                    description: `Removing this single filler word will instantly make you sound more confident and professional.`,
                    impact: 'high',
                    difficulty: 'easy',
                    category: 'fluency',
                    relatedHighlights: fillerWords.filter(h => h.text === topFiller[0]),
                    practiceInstructions: [
                        `Listen to each instance of "${topFiller[0]}" in your recording`,
                        'Practice the same sentence with a brief pause instead',
                        'Record yourself saying the sentence 3 times without the filler',
                        'Focus on breathing before speaking to avoid rushing'
                    ],
                    estimatedTime: '10 minutes',
                    completed: false
                })
            }
        }

        // Medium Impact: Weak Phrases
        if (weakPhrases.length >= 2) {
            const uniqueWeakPhrases = [...new Set(weakPhrases.map(h => h.text))]
            items.push({
                id: 'strengthen-language',
                title: `Replace weak phrases (${uniqueWeakPhrases.length} found)`,
                description: 'Transform uncertain language into confident, specific statements.',
                impact: 'medium',
                difficulty: 'medium',
                category: 'vocabulary',
                relatedHighlights: weakPhrases,
                practiceInstructions: [
                    'Click on each highlighted weak phrase to hear it in context',
                    'Choose one alternative from the suggestions',
                    'Practice saying the sentence with the stronger alternative',
                    'Record yourself using the improved version'
                ],
                estimatedTime: '15 minutes',
                completed: false
            })
        }

        // Grammar-based items from analysis
        const grammarScore = feedbackData.analysis.grammar.score.raw_score
        if (grammarScore < 7) {
            items.push({
                id: 'improve-grammar',
                title: 'Polish sentence structure',
                description: 'Focus on complete sentences and proper verb tenses.',
                impact: 'medium',
                difficulty: 'medium',
                category: 'grammar',
                relatedHighlights: [],
                practiceInstructions: [
                    'Read your transcript aloud to identify incomplete sentences',
                    'Practice speaking in complete thoughts',
                    'Focus on subject-verb agreement',
                    'Use transition words to connect ideas'
                ],
                estimatedTime: '20 minutes',
                completed: false
            })
        }

        // Pronunciation issues
        if (pronunciationIssues.length > 0) {
            items.push({
                id: 'pronunciation-practice',
                title: `Master pronunciation (${pronunciationIssues.length} words)`,
                description: 'Clear pronunciation enhances your professional credibility.',
                impact: 'medium',
                difficulty: 'easy',
                category: 'fluency',
                relatedHighlights: pronunciationIssues,
                practiceInstructions: [
                    'Click each highlighted word to hear it in context',
                    'Look up correct pronunciation online',
                    'Practice the word in isolation 5 times',
                    'Use the word in 3 different sentences'
                ],
                estimatedTime: '12 minutes',
                completed: false
            })
        }

        // Time management based on analysis
        const timeScore = feedbackData.analysis.time_management.score.raw_score
        if (timeScore < 7) {
            items.push({
                id: 'time-management',
                title: 'Optimize speaking pace and timing',
                description: 'Make every second count in your 1-minute presentations.',
                impact: 'high',
                difficulty: 'hard',
                category: 'time_management',
                relatedHighlights: [],
                practiceInstructions: [
                    'Practice with a timer - aim for 55-60 seconds',
                    'Prepare 3 key points before speaking',
                    'Use the first 10 seconds for a strong opening',
                    'Save 10 seconds for a memorable conclusion'
                ],
                estimatedTime: '25 minutes',
                completed: false
            })
        }

        // Sort by impact and difficulty
        return items.sort((a, b) => {
            const impactOrder = { high: 3, medium: 2, low: 1 }
            const difficultyOrder = { easy: 3, medium: 2, hard: 1 }

            const aScore = impactOrder[a.impact] + difficultyOrder[a.difficulty]
            const bScore = impactOrder[b.impact] + difficultyOrder[b.difficulty]

            return bScore - aScore
        })
    }, [feedbackData])

    const handleToggleComplete = (itemId: string) => {
        const newCompleted = new Set(completedItems)
        if (newCompleted.has(itemId)) {
            newCompleted.delete(itemId)
        } else {
            newCompleted.add(itemId)
        }
        setCompletedItems(newCompleted)
    }

    const handleHighlightClick = (highlight: GrammarlyHighlight) => {
        if (onJumpToHighlight) {
            onJumpToHighlight(highlight)
        }
    }

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'high': return <Zap className="w-4 h-4 text-red-500" />
            case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-500" />
            case 'low': return <Star className="w-4 h-4 text-blue-500" />
            default: return null
        }
    }

    const getImpactLabel = (impact: string) => {
        switch (impact) {
            case 'high': return 'HIGH IMPACT'
            case 'medium': return 'MEDIUM IMPACT'
            case 'low': return 'POLISH'
            default: return ''
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-red-50 text-red-700 border-red-200'
            case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'low': return 'bg-blue-50 text-blue-700 border-blue-200'
            default: return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const completedCount = completedItems.size
    const totalCount = actionItems.length
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Your Personalized Action Plan</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Based on your speech analysis • {completedCount} of {totalCount} completed
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
                        <div className="text-xs text-gray-500">Progress</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-4">
                {actionItems.map((item) => {
                    const isCompleted = completedItems.has(item.id)
                    const isExpanded = expandedItem === item.id

                    return (
                        <div
                            key={item.id}
                            className={`border rounded-xl transition-all duration-200 ${isCompleted
                                ? 'bg-green-50 border-green-200 opacity-75'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Item Header */}
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleToggleComplete(item.id)}
                                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {isCompleted && <Check className="w-3 h-3" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getImpactIcon(item.impact)}
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getImpactColor(item.impact)}`}>
                                                {getImpactLabel(item.impact)}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {item.estimatedTime}
                                            </span>
                                        </div>

                                        <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>

                                        {/* Related Highlights Preview */}
                                        {item.relatedHighlights.length > 0 && (
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="text-xs text-gray-500">Found in transcript:</span>
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.relatedHighlights.slice(0, 3).map((highlight, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleHighlightClick(highlight)}
                                                            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                                        >
                                                            "{highlight.text}"
                                                        </button>
                                                    ))}
                                                    {item.relatedHighlights.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{item.relatedHighlights.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Practice Instructions */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Practice Instructions
                                    </h4>
                                    <ol className="space-y-2">
                                        {item.practiceInstructions.map((instruction, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-gray-700">
                                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                                    {idx + 1}
                                                </span>
                                                <span>{instruction}</span>
                                            </li>
                                        ))}
                                    </ol>

                                    {item.relatedHighlights.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Practice with your recording:
                                                </span>
                                                <button
                                                    onClick={onPlayAudio}
                                                    className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Play className="w-3 h-3" />
                                                    Play Audio
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Completion Celebration */}
            {completedCount === totalCount && totalCount > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 text-center">
                    <div className="text-2xl mb-2">🎉</div>
                    <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
                    <p className="text-sm opacity-90">
                        You've completed all action items. Ready for your next JAM session?
                    </p>
                    <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                        Practice Again
                    </button>
                </div>
            )}
        </div>
    )
}
