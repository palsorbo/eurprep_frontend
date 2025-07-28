import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Grid, List } from 'lucide-react'
import TopicCard from './TopicCard'
import type { Topic } from '../../lib/types/track'

interface TopicGridProps {
    topics: Topic[]
    trackId: string
    loading?: boolean
}

type SortOption = 'name' | 'difficulty'
type ViewMode = 'grid' | 'list'

export default function TopicGrid({ topics, trackId, loading = false }: TopicGridProps) {
    const [sortBy, setSortBy] = useState<SortOption>('name')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchTerm, setSearchTerm] = useState('')


    const filteredAndSortedTopics = useMemo(() => {
        let filtered = topics

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(topic =>
                topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                topic.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title)
                case 'difficulty':
                    return a.difficulty.localeCompare(b.difficulty)
                default:
                    return 0
            }
        })
    }, [topics, searchTerm, sortBy])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        )
    }

    if (topics.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600">No topics available for this track.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="difficulty">Sort by Difficulty</option>
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                            }`}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                            }`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-600">
                {filteredAndSortedTopics.length} of {topics.length} topics
            </div>

            {/* Topics Grid/List */}
            <div className={
                viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
            }>
                {filteredAndSortedTopics.map((topic) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        trackId={trackId}
                    />
                ))}
            </div>

            {filteredAndSortedTopics.length === 0 && searchTerm && (
                <div className="text-center py-12">
                    <p className="text-slate-600">No topics match your search.</p>
                </div>
            )}
        </div>
    )
} 