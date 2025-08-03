import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Clock, Star, Play, Calendar, Filter, Search, ArrowLeft } from 'lucide-react'
import { useRecentRecordings } from '../hooks'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import type { JamRecording } from '../lib/database/types'

export default function RecordingsPage() {
    const { recordings, loading, error } = useRecentRecordings(50) // Show more recordings
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

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
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredRecordings = recordings.filter(recording => {
        const matchesSearch = recording.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recording.status.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || recording.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'processing', label: 'Processing' },
        { value: 'analyzing', label: 'Analyzing' },
        { value: 'failed', label: 'Failed' }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <AuthenticatedHeader pageTitle="Recordings" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="w-20 h-6 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50">
                <AuthenticatedHeader pageTitle="Recordings" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Recordings</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthenticatedHeader pageTitle="Recordings" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            to="/app"
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Your JAM Recordings</h1>
                    <p className="text-gray-600">Review and analyze your practice sessions</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search recordings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Recordings List */}
                {recordings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Recordings Yet</h3>
                        <p className="text-gray-600 mb-6">Start practicing to see your recordings here</p>
                        <Link
                            to="/app/tracks/jam/practice"
                            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium"
                        >
                            Start Practice
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRecordings.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Matching Recordings</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            filteredRecordings.map((recording) => (
                                <Link
                                    key={recording.id}
                                    to={`/app/jam-feedback/${recording.id}`}
                                    className="block bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                                                <Play className="w-6 h-6 text-sky-600 group-hover:scale-110 transition-transform" />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-slate-900">JAM Recording</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(recording.status)}`}>
                                                        {recording.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-6 text-sm text-gray-600">
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
                                        </div>
                                        
                                        <div className="text-sky-600 group-hover:text-sky-700">
                                            <Play className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* Stats */}
                {recordings.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{recordings.length}</div>
                                <div className="text-sm text-gray-600">Total Recordings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {recordings.filter(r => r.status === 'completed').length}
                                </div>
                                <div className="text-sm text-gray-600">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {recordings.filter(r => r.status === 'analyzing').length}
                                </div>
                                <div className="text-sm text-gray-600">Analyzing</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {recordings.filter(r => r.status === 'failed').length}
                                </div>
                                <div className="text-sm text-gray-600">Failed</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 