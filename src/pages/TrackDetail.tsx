

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    Play,
    Target,
    Clock,
    TrendingUp,
    Star,
    Users,
    BarChart3,
    Home
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import { getTrackById } from '../lib/data/tracks'
import { getTopicsByTrack } from '../lib/data/topics'
import type { Track, Topic } from '../lib/types/track'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'

export default function TrackOverview() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null)
    const [track, setTrack] = useState<Track | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)
    const [userProgress, setUserProgress] = useState({
        completedTopics: 0,
        totalTopics: 0,
        averageScore: 0,
        totalPracticeTime: 0,
        lastPracticeDate: null as string | null
    })

    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        const loadTrackAndTopics = async () => {
            const trackId = params.trackId as string
            const currentTrack = getTrackById(trackId)

            if (!currentTrack) {
                navigate('/app')
                return
            }

            if (currentTrack.status === 'coming-soon') {
                navigate('/app')
                return
            }

            setTrack(currentTrack)

            try {
                // Get topics for this track (now async)
                const trackTopics = await getTopicsByTrack(trackId)
                setTopics(trackTopics)
            } catch (error) {
                console.error('Error loading topics:', error)
                setTopics([])
            }

            setLoading(false)
        }

        loadTrackAndTopics()
    }, [params.trackId, navigate])

    const checkUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            navigate('/app/login')
            return
        }
        setUser(user as unknown as Record<string, unknown>)
    }, [navigate])

    const fetchUserProgress = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || !track) return

            // Fetch user's recordings for this track
            const { data: recordings } = await supabase
                .from('recordings')
                .select('*')
                .eq('user_id', user.id)
                .eq('track_id', track.id)
                .order('created_at', { ascending: false })

            if (recordings) {
                const totalPracticeTime = recordings.reduce((acc, rec) => acc + (rec.duration_seconds || 0), 0)
                const lastPracticeDate = recordings.length > 0 ? recordings[0].created_at : null

                setUserProgress({
                    completedTopics: recordings.length,
                    totalTopics: topics.length,
                    averageScore: 0, // Will be calculated from feedback data
                    totalPracticeTime,
                    lastPracticeDate
                })
            }
        } catch (error) {
            console.error('Error fetching user progress:', error)
        }
    }, [track, topics.length])

    useEffect(() => {
        checkUser()
        fetchUserProgress()
    }, [checkUser, fetchUserProgress])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-700'
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-700'
            case 'advanced':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner':
                return <Star className="w-4 h-4" />
            case 'intermediate':
                return <TrendingUp className="w-4 h-4" />
            case 'advanced':
                return <Target className="w-4 h-4" />
            default:
                return <Star className="w-4 h-4" />
        }
    }

    const getBreadcrumbItems = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [
            { label: 'Dashboard', href: '/app', icon: Home }
        ]

        if (track) {
            items.push({
                label: track.title
            })
        }

        return items
    }

    if (loading || !user || !track) {
        return (
            <LoadingScreen
                message="Loading track..."
                size="md"
            />
        )
    }

    const IconComponent = track.icon
    const progressPercentage = userProgress.totalTopics > 0
        ? Math.round((userProgress.completedTopics / userProgress.totalTopics) * 100)
        : 0

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthenticatedHeader
                pageTitle={track.title}
                showBreadcrumbs={true}
                breadcrumbItems={getBreadcrumbItems()}
                trackIcon={track.icon}
                trackColor={track.color}
                trackBgColor={track.bgColor}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Track Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                    <div className="flex items-start space-x-6">
                        <div className={`w-16 h-16 ${track.bgColor} rounded-xl flex items-center justify-center`}>
                            <IconComponent className={`w-8 h-8 ${track.color}`} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getDifficultyColor(track.difficulty)}`}>
                                    {getDifficultyIcon(track.difficulty)}
                                    <span className="capitalize">{track.difficulty}</span>
                                </span>
                            </div>

                            <p className="text-gray-600 text-lg mb-4 max-w-3xl">
                                {track.description}
                            </p>

                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Target className="w-4 h-4" />
                                    <span>{topics.length} topics</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{track.estimatedTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{track.category}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            to={`/tracks/${track.id}/practice`}
                            className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
                        >
                            <Play className="w-5 h-5" />
                            <span>Start Practice</span>
                        </Link>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Progress Overview */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Progress</h2>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                                <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {userProgress.completedTopics} of {userProgress.totalTopics} topics completed
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-600">Total Practice Time</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {Math.round(userProgress.totalPracticeTime / 60)}m
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChart3 className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-600">Average Score</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {userProgress.averageScore > 0 ? `${userProgress.averageScore}/10` : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {userProgress.lastPracticeDate && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Last practice:</span> {new Date(userProgress.lastPracticeDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Track Stats</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Difficulty Level</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(track.difficulty)}`}>
                                    {track.difficulty}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Category</span>
                                <span className="text-sm font-medium text-slate-900">{track.category}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Topics Available</span>
                                <span className="text-sm font-medium text-slate-900">{topics.length}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Estimated Time</span>
                                <span className="text-sm font-medium text-slate-900">{track.estimatedTime}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {track.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Topics Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Available Topics</h2>
                        <Link
                            to={`/tracks/${track.id}/practice`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View All Topics
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topics.slice(0, 6).map((topic) => (
                            <div
                                key={topic.id}
                                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                                        {topic.category}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                                        {topic.difficulty}
                                    </span>
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">{topic.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{topic.description}</p>
                            </div>
                        ))}
                    </div>

                    {topics.length > 6 && (
                        <div className="mt-6 text-center">
                            <Link
                                to={`/tracks/${track.id}/practice`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View all {topics.length} topics →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 