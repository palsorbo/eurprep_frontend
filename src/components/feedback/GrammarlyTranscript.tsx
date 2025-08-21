import { useState, useMemo } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import type { GrammarlyHighlight } from '../../lib/config'

interface GrammarlyTranscriptProps {
    transcript: string
    highlights: GrammarlyHighlight[]
    isPlaying: boolean
    currentTime: number
    duration: number
    onPlayPause: () => void
    onSeek: (time: number) => void
    onSkip: (seconds: number) => void
    onSpeedChange: (speed: number) => void
    onJumpToHighlight?: (highlight: GrammarlyHighlight) => void
}

export default function GrammarlyTranscript({
    transcript,
    highlights,
    isPlaying,
    currentTime,
    duration,
    onPlayPause,
    onSeek,
    onSkip,
    onSpeedChange,
    onJumpToHighlight
}: GrammarlyTranscriptProps) {
    const [playbackSpeed, setPlaybackSpeed] = useState(1)

    // Process transcript with highlights
    const processedTranscript = useMemo(() => {
        if (!highlights || highlights.length === 0) {
            return transcript
        }

        // Sort highlights by start position to process them in order
        const sortedHighlights = [...highlights].sort((a, b) => a.start_position - b.start_position)

        let processedText = transcript
        let offset = 0

        sortedHighlights.forEach((highlight) => {
            // Backend now provides validated positions, so we can trust them
            const actualStart = highlight.start_position + offset
            const actualEnd = highlight.end_position + offset



            const beforeText = processedText.substring(0, actualStart)
            const highlightText = processedText.substring(actualStart, actualEnd)
            const afterText = processedText.substring(actualEnd)

            const highlightClass = getHighlightClass(highlight.type)
            const tooltipClass = getTooltipClass(highlight.type)

            const alternativesHtml = highlight.suggestions && highlight.suggestions.length > 0
                ? `<div class="tooltip-alternatives">${highlight.suggestions.map(alt =>
                    `<span class="suggestion-word">${alt}</span>`
                ).join('')}</div>`
                : ''

            const highlightHtml = `<span class="${highlightClass}" data-highlight="${encodeURIComponent(JSON.stringify(highlight))}">${highlightText}<span class="tooltip ${tooltipClass}"><div class="tooltip-header">${getTooltipHeader(highlight.type)}</div><div class="tooltip-content"><div class="tooltip-suggestion">${highlight.message}</div>${alternativesHtml}</div></span></span>`

            processedText = beforeText + highlightHtml + afterText

            // Update offset based on actual position changes
            const lengthDifference = highlightHtml.length - highlightText.length
            offset += lengthDifference

        })
        return processedText
    }, [transcript, highlights])

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed)
        onSpeedChange(speed)
    }

    const handleHighlightClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement
        const highlightElement = target.closest('[data-highlight]')

        if (highlightElement && onJumpToHighlight) {
            const highlightData = highlightElement.getAttribute('data-highlight')
            if (highlightData) {
                try {
                    const highlight = JSON.parse(decodeURIComponent(highlightData)) as GrammarlyHighlight
                    onJumpToHighlight(highlight)
                } catch (e) {
                    console.error('Failed to parse highlight data:', e);
                }
            }
        }
    }

    const progress = useMemo(() => {
        if (!duration || !isFinite(duration) || duration <= 0) return 0
        return Math.min(100, Math.max(0, (currentTime / duration) * 100))
    }, [currentTime, duration])

    const formatTime = (totalSeconds: number): string => {
        // Handle invalid values
        if (!isFinite(totalSeconds) || totalSeconds < 0) {
            return '0:00'
        }

        const minutes = Math.floor(totalSeconds / 60)
        const seconds = Math.floor(totalSeconds % 60)
        const padded = seconds.toString().padStart(2, '0')
        return `${minutes}:${padded}`
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Audio Controls Header - More Compact */}
            <div className="bg-slate-50 border-b border-slate-200 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onPlayPause}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => onSkip(-10)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                            aria-label="Skip back 10 seconds"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => onSkip(10)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                            aria-label="Skip forward 10 seconds"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Volume2 className="w-4 h-4" />
                            <select
                                value={playbackSpeed}
                                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                                className="border border-slate-300 rounded px-2 py-1 text-sm"
                            >
                                <option value={0.5}>0.5x</option>
                                <option value={0.75}>0.75x</option>
                                <option value={1}>1x</option>
                                <option value={1.25}>1.25x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2x</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-sm text-slate-600">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                    <div className="relative">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sky-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => {
                                const newProgress = Number(e.target.value)
                                const newTime = (newProgress / 100) * duration
                                onSeek(newTime)
                            }}
                            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Transcript Content - More Compact */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Speech Transcript</h3>
                    <p className="text-xs text-slate-600">
                        Hover over highlighted text for suggestions. Click highlights to jump to audio position.
                    </p>
                </div>

                <div
                    className="transcript-content text-base leading-relaxed text-slate-800"
                    onClick={handleHighlightClick}
                    dangerouslySetInnerHTML={{ __html: processedTranscript }}
                />
            </div>
        </div>
    )
}

// Helper functions for styling
function getHighlightClass(type: string): string {
    const baseClass = "relative cursor-pointer transition-all duration-200 hover:bg-opacity-80"

    switch (type) {
        case 'filler_word':
            return `${baseClass} filler-word bg-red-100 border-b-2 border-red-400 text-red-800`
        case 'weak_phrase':
            return `${baseClass} weak-phrase bg-yellow-100 border-b-2 border-yellow-400 text-yellow-800`
        case 'formal_term':
            return `${baseClass} formal-term bg-blue-100 border-b-2 border-blue-400 text-blue-800`
        case 'natural_phrase':
            return `${baseClass} natural-phrase bg-green-100 border-b-2 border-green-400 text-green-800`
        case 'pronunciation_issue':
            return `${baseClass} pronunciation-issue bg-orange-100 border-b-2 border-orange-400 text-orange-800`
        default:
            return baseClass
    }
}

function getTooltipClass(type: string): string {
    switch (type) {
        case 'filler_word':
            return 'tooltip-type-filler'
        case 'weak_phrase':
            return 'tooltip-type-weak'
        case 'formal_term':
            return 'tooltip-type-formal'
        case 'natural_phrase':
            return 'tooltip-type-good'
        case 'pronunciation_issue':
            return 'tooltip-type-weak'
        default:
            return ''
    }
}

function getTooltipHeader(type: string): string {
    switch (type) {
        case 'filler_word':
            return 'Filler Word'
        case 'weak_phrase':
            return 'Consider Revision'
        case 'formal_term':
            return 'Excellent Choice'
        case 'natural_phrase':
            return 'Great Flow'
        case 'pronunciation_issue':
            return 'Pronunciation Guide'
        default:
            return 'Suggestion'
    }
}
