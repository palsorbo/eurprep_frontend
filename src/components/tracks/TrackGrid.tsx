import { useState, useMemo } from 'react'
import { Filter, Grid, List } from 'lucide-react'
import type { Track } from '../../lib/types/track'
import TrackCard from './TrackCard'

interface TrackGridProps {
    tracks: Track[]
    userProgress?: Record<string, {
        completedTopics: number
        totalTopics: number
        averageScore: number
        lastPracticeDate: string | null
    }>
    showProgress?: boolean
    className?: string
}

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'difficulty' | 'category' | 'status'

export default function TrackGrid({
    tracks,
    userProgress = {},
    showProgress = true,
    className = ''
}: TrackGridProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [sortBy] = useState<SortOption>('status')



    // Filter and sort tracks
    const filteredAndSortedTracks = useMemo(() => {
        const filtered = tracks.filter(track => {
            const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory
            const matchesDifficulty = selectedDifficulty === 'all' || track.difficulty === selectedDifficulty
            const matchesStatus = selectedStatus === 'all' || track.status === selectedStatus

            return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
        })

        // Sort tracks
        filtered.sort((a, b) => {
            // Always prioritize JAM track to appear first
            if (a.id === 'jam') return -1
            if (b.id === 'jam') return 1

            switch (sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title)
                case 'difficulty': {
                    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
                    return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
                        difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
                }
                case 'category':
                    return a.category.localeCompare(b.category)
                case 'status': {
                    const statusOrder = { 'active': 1, 'coming-soon': 2, 'locked': 3 }
                    return statusOrder[a.status as keyof typeof statusOrder] -
                        statusOrder[b.status as keyof typeof statusOrder]
                }
                default:
                    return 0
            }
        })

        return filtered
    }, [tracks, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, sortBy])

    const activeTracksCount = tracks.filter(track => track.status === 'active').length
    const totalTracksCount = tracks.length

    return (
        <div className={className}>
            {/* Header with Stats */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Practice Tracks</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeTracksCount} of {totalTracksCount} tracks available
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                            ? 'bg-slate-100 text-slate-700'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                            ? 'bg-slate-100 text-slate-700'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Showing {filteredAndSortedTracks.length} of {tracks.length} tracks
                </p>
            </div>

            {/* Track Grid/List */}
            {filteredAndSortedTracks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No tracks found</h3>
                    <p className="text-gray-600 mb-4">
                        Try adjusting your search or filters to find what you&apos;re looking for.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedDifficulty('all')
                            setSelectedStatus('all')
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                }>
                    {filteredAndSortedTracks.map((track) => (
                        <TrackCard
                            key={track.id}
                            track={track}
                            userProgress={userProgress[track.id]}
                            showProgress={showProgress}
                            className={viewMode === 'list' ? 'flex items-center space-x-4' : ''}
                        />
                    ))}
                </div>
            )}
        </div>
    )
} 