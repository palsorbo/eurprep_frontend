import { Link } from 'react-router-dom'
import { Mic, Clock, Star, Play, Calendar } from 'lucide-react'
import { useRecentRecordings } from '../hooks'
import type { JamRecording } from '../lib/database/types'

interface RecentRecordingsProps {
    limit?: number
    showTitle?: boolean
}

export default function RecentRecordings({ limit = 5, showTitle = true }: RecentRecordingsProps) {
    const { recordings, loading, error } = useRecentRecordings(limit)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100'
            case 'processing':
                return 'text-yellow-600 bg-yellow-100'
            case 'analyzing':
                return 'text-blue-600 bg-blue-100'
            case 'failed':
                return 'text-red-600 bg-red-100'
            default:
                return 'text-gray-600 bg-gray-100'
        }
    }

    const getScoreDisplay = (recording: JamRecording) => {
        if (recording.overall_score !== null && recording.overall_score !== undefined) {
            return (
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{recording.overall_score}/10</span>
                </div>
            )
        }
        return <span className="text-sm text-gray-500">No score</span>
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
            return 'Today'
        } else if (diffDays === 2) {
            return 'Yesterday'
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {showTitle && (
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Recordings</h2>
                    </div>
                )}
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                                <div className="w-16 h-4 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {showTitle && (
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Recordings</h2>
                    </div>
                )}
                <div className="text-center py-8">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-gray-600">Failed to load recordings</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    if (recordings.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {showTitle && (
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Recordings</h2>
                    </div>
                )}
                <div className="text-center py-8">
                    <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recordings yet</p>
                    <p className="text-sm text-gray-500">Start practicing to see your recordings here</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {showTitle && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Recent Recordings</h2>
                    <Link
                        to="/app/recordings"
                        className="text-slate-700 hover:text-slate-900 text-sm font-medium"
                    >
                        View All
                    </Link>
                </div>
            )}

            <div className="space-y-3">
                {recordings.map((recording) => (
                    <Link
                        key={recording.id}
                        to={`/app/jam-feedback/${recording.id}`}
                        className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-slate-900 truncate">
                                    JAM Recording
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recording.status)}`}>
                                    {recording.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{recording.duration_seconds}s</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(recording.created_at)}</span>
                                </div>
                                {recording.overall_score !== null && (
                                    <div className="flex items-center gap-1">
                                        {getScoreDisplay(recording)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-sky-600 group-hover:text-sky-700">
                            <Play className="w-4 h-4" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
} 