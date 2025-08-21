import { Link } from 'react-router-dom'
import { Play, Download, RotateCcw } from 'lucide-react'
import type { FeedbackResponse } from '../../lib/config'

interface MetricsSidebarProps {
    feedbackData: FeedbackResponse
    onPlayPause: () => void
    isPlaying: boolean
}

export default function MetricsSidebar({ feedbackData, onPlayPause, isPlaying }: MetricsSidebarProps) {
    const { analysis, time_usage, summary } = feedbackData

    // Calculate metrics for display
    const wpm = Math.round(time_usage.speech_rate_wpm)
    const fillerCount = analysis.fluency.filler_words.total_fillers
    const pauseCount = analysis.fluency.pause_analysis.total_pauses
    const clarity = getClarity(analysis.fluency.score.raw_score)
    const formalScore = getFormalScore(analysis.vocabulary.score.raw_score, analysis.grammar.score.raw_score)
    const confidence = getConfidence(analysis.coherence.score.raw_score)

    return (
        <div className="space-y-4">
            {/* Overall Score - More Compact */}
            <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold mb-1">{Math.round(summary.weightedOverallScore)}</div>
                <div className="text-sky-100 text-xs">Overall Score</div>
            </div>

            {/* Consolidated Metrics Dashboard */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Performance Metrics</h3>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <MetricCard
                        label="WPM"
                        value={wpm.toString()}
                        status={getWpmStatus(wpm)}
                        subtitle="words/min"
                    />
                    <MetricCard
                        label="Fillers"
                        value={fillerCount.toString()}
                        status={getFillerStatus(fillerCount)}
                        subtitle="count"
                    />
                    <MetricCard
                        label="Clarity"
                        value={getScoreValue(analysis.fluency.score.raw_score)}
                        status={getScoreStatus(analysis.fluency.score.raw_score)}
                        subtitle="rating"
                    />
                    <MetricCard
                        label="Confidence"
                        value={getScoreValue(analysis.coherence.score.raw_score)}
                        status={getScoreStatus(analysis.coherence.score.raw_score)}
                        subtitle="rating"
                    />
                </div>

                {/* Secondary Metrics */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                    <MetricRow
                        label="Pauses"
                        value={pauseCount.toString()}
                        status={getPauseStatus(pauseCount)}
                    />
                    <MetricRow
                        label="Formal language"
                        value={formalScore}
                        status={getScoreStatus(analysis.vocabulary.score.raw_score)}
                    />
                    <MetricRow
                        label="Specificity"
                        value={getSpecificity(analysis.vocabulary.score.raw_score)}
                        status={getScoreStatus(analysis.vocabulary.score.raw_score)}
                    />
                </div>
            </div>

            {/* Quick Actions - More Compact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={onPlayPause}
                        className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Play className="w-4 h-4" />
                        {isPlaying ? 'Pause' : 'Play Recording'}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            to="/app/tracks/jam/practice"
                            className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-lg transition-colors text-xs font-medium"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Practice Again
                        </Link>

                        <button
                            onClick={() => {
                                const blob = new Blob([feedbackData.originalTranscript], { type: 'text/plain' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = 'transcript.txt'
                                a.click()
                                URL.revokeObjectURL(url)
                            }}
                            className="flex items-center justify-center gap-1.5 bg-slate-600 hover:bg-slate-700 text-white px-2 py-2 rounded-lg transition-colors text-xs font-medium"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Insights - More Useful */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Quick Insights</h3>

                <div className="space-y-3">
                    {/* Key Strength */}
                    <div className="bg-green-50 border-l-2 border-green-400 p-2.5 rounded">
                        <div className="text-xs font-medium text-green-800 mb-1">✓ Strength</div>
                        <div className="text-xs text-green-700 leading-relaxed">
                            {getTopStrength(feedbackData)}
                        </div>
                    </div>

                    {/* Key Improvement */}
                    <div className="bg-blue-50 border-l-2 border-blue-400 p-2.5 rounded">
                        <div className="text-xs font-medium text-blue-800 mb-1">→ Focus On</div>
                        <div className="text-xs text-blue-700 leading-relaxed">
                            {getTopImprovement(feedbackData)}
                        </div>
                    </div>

                    {/* Next Practice Tip */}
                    <div className="bg-purple-50 border-l-2 border-purple-400 p-2.5 rounded">
                        <div className="text-xs font-medium text-purple-800 mb-1">💡 Next Practice</div>
                        <div className="text-xs text-purple-700 leading-relaxed">
                            {getNextPracticeTip(feedbackData)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper component for metric cards
function MetricCard({ label, value, status, subtitle }: {
    label: string;
    value: string;
    status: 'good' | 'warning' | 'error';
    subtitle?: string;
}) {
    const statusColors = {
        good: 'text-green-600 bg-green-50 border-green-200',
        warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        error: 'text-red-600 bg-red-50 border-red-200'
    }

    return (
        <div className={`p-3 rounded-lg border ${statusColors[status]} text-center`}>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs font-medium">{label}</div>
            {subtitle && <div className="text-xs opacity-75 mt-0.5">{subtitle}</div>}
        </div>
    )
}

// Helper component for metric rows
function MetricRow({ label, value, status }: { label: string; value: string; status: 'good' | 'warning' | 'error' }) {
    const statusColors = {
        good: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
    }

    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-600 text-xs">{label}</span>
            <span className={`font-semibold text-xs ${statusColors[status]}`}>{value}</span>
        </div>
    )
}

// Helper functions for metric calculations
function getScoreValue(score: number): string {
    return Math.round(score).toString()
}

function getClarity(score: number): string {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Poor'
}

function getFormalScore(vocabScore: number, grammarScore: number): string {
    const avg = (vocabScore + grammarScore) / 2
    if (avg >= 8) return 'Excellent'
    if (avg >= 6) return 'High'
    if (avg >= 4) return 'Medium'
    return 'Low'
}

function getSpecificity(score: number): string {
    if (score >= 8) return 'High'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Medium'
    return 'Low'
}

function getConfidence(score: number): string {
    if (score >= 8) return 'High'
    if (score >= 6) return 'Medium'
    if (score >= 4) return 'Low'
    return 'Very Low'
}

function getWpmStatus(wpm: number): 'good' | 'warning' | 'error' {
    if (wpm >= 140 && wpm <= 160) return 'good'
    if (wpm >= 120 && wpm <= 180) return 'warning'
    return 'error'
}

function getFillerStatus(count: number): 'good' | 'warning' | 'error' {
    if (count <= 2) return 'good'
    if (count <= 4) return 'warning'
    return 'error'
}

function getPauseStatus(count: number): 'good' | 'warning' | 'error' {
    if (count >= 4) return 'good'
    if (count >= 2) return 'warning'
    return 'error'
}

function getScoreStatus(score: number): 'good' | 'warning' | 'error' {
    if (score >= 7) return 'good'
    if (score >= 5) return 'warning'
    return 'error'
}

// Smart insight generators
function getTopStrength(feedbackData: FeedbackResponse): string {
    const { analysis } = feedbackData
    const scores = [
        { area: 'fluency', score: analysis.fluency.score.raw_score, strength: 'Clear and smooth delivery' },
        { area: 'vocabulary', score: analysis.vocabulary.score.raw_score, strength: 'Rich vocabulary usage' },
        { area: 'grammar', score: analysis.grammar.score.raw_score, strength: 'Excellent grammar structure' },
        { area: 'coherence', score: analysis.coherence.score.raw_score, strength: 'Well-organized thoughts' }
    ]

    const topScore = scores.reduce((max, current) => current.score > max.score ? current : max)
    return topScore.strength
}

function getTopImprovement(feedbackData: FeedbackResponse): string {
    const { analysis } = feedbackData
    const scores = [
        { area: 'fluency', score: analysis.fluency.score.raw_score, improvement: 'Reduce filler words and pauses' },
        { area: 'vocabulary', score: analysis.vocabulary.score.raw_score, improvement: 'Use more varied vocabulary' },
        { area: 'grammar', score: analysis.grammar.score.raw_score, improvement: 'Focus on sentence structure' },
        { area: 'coherence', score: analysis.coherence.score.raw_score, improvement: 'Improve logical flow' }
    ]

    const lowestScore = scores.reduce((min, current) => current.score < min.score ? current : min)
    return lowestScore.improvement
}

function getNextPracticeTip(feedbackData: FeedbackResponse): string {
    const wpm = feedbackData.time_usage.speech_rate_wpm
    const fillerCount = feedbackData.analysis.fluency.filler_words.total_fillers

    if (fillerCount > 3) {
        return 'Practice speaking without "um", "uh", or "like" - pause instead'
    } else if (wpm < 130) {
        return 'Practice speaking slightly faster - aim for 140-160 WPM'
    } else if (wpm > 180) {
        return 'Slow down slightly and add natural pauses for emphasis'
    } else {
        return 'Focus on using more specific, concrete examples in your responses'
    }
}
