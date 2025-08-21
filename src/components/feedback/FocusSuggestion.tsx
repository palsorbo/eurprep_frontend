import DetailedExamples from './DetailedExamples'
import FillerWordsBreakdown from './FillerWordsBreakdown'

interface FocusSuggestionProps {
    active: 'fluency' | 'coherence' | 'vocabulary' | 'grammar' | 'time_management'
    data: any
    durationSec: number
    onJumpTo?: (seconds: number) => void
}

export default function FocusSuggestion({ active, data, durationSec, onJumpTo }: FocusSuggestionProps) {
    if (active === 'fluency') {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <FillerWordsBreakdown data={data.fluency.filler_words} duration={durationSec} />
            </div>
        )
    }

    if (active === 'time_management') {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <DetailedExamples category="time_management" issues={data.time_management.issues} display="all" onJumpTo={onJumpTo} />
            </div>
        )
    }

    if (active === 'coherence') {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <DetailedExamples category="coherence" issues={data.coherence.issues} display="all" onJumpTo={onJumpTo} />
            </div>
        )
    }

    if (active === 'vocabulary') {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <DetailedExamples category="vocabulary" issues={data.vocabulary.issues} display="all" onJumpTo={onJumpTo} />
            </div>
        )
    }

    if (active === 'grammar') {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <DetailedExamples category="grammar" issues={data.grammar.issues} display="all" onJumpTo={onJumpTo} />
            </div>
        )
    }

    return null
}



