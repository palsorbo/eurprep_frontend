import { Link } from 'react-router-dom'
import { Play, Pause } from 'lucide-react'

interface OutcomeHeaderProps {
    title: string
    status?: string | null
    score?: number | null
    isPlaying: boolean
    onPlayPause: () => void
}

export default function OutcomeHeader({ title, status, score, isPlaying, onPlayPause }: OutcomeHeaderProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="mb-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">JAM Session Analysis Complete</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                        {status ? <span>Status: {status}</span> : null}
                        {typeof score === 'number' ? <span>Score: {score}/10</span> : null}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onPlayPause}
                        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? 'Pause' : 'Play Recording'}
                    </button>
                    <Link to="/app/tracks/jam/practice" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50">Practice Again</Link>
                    <Link to="/app/recordings" className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900">Back to Recordings</Link>
                </div>
            </div>
            <p className="mt-3 text-slate-700">Do this next: pick 2–3 items from your plan and practice another JAM today to reinforce gains.</p>
        </div>
    )
}



