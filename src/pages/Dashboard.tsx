

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import {
    Clock,
    Target,
    Play,
    Calendar,
    Mic,
    BarChart3
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import AnimatedTarget from '../components/AnimatedTarget'
import TrackGrid from '../components/tracks/TrackGrid'
import CircularProgress from '../components/CircularProgress'
import NotRatedYet from '../components/NotRatedYet'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import { TRACKS } from '../lib/data/tracks'
import { COLORS } from '../lib/constants/colors'
import { formatTime } from '../lib/utils'
import { useUserStats, useUserProgress } from '../hooks'

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth()
    const { stats, loading: statsLoading, error: statsError } = useUserStats()
    const { progress: userProgress, loading: progressLoading, error: progressError } = useUserProgress()
    const navigate = useNavigate()

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    const loading = authLoading || statsLoading || progressLoading

    const handleResumePractice = () => {
        // Find the last practiced track
        const lastPracticedTrack = Object.entries(userProgress)
            .filter(([_, progress]) => progress.lastPracticeDate)
            .sort(([_, a], [__, b]) =>
                new Date(b.lastPracticeDate!).getTime() - new Date(a.lastPracticeDate!).getTime()
            )

        if (lastPracticedTrack.length > 0) {
            navigate(`/tracks/${lastPracticedTrack[0][0]}/practice`)
        }
    }

    if (authLoading || loading) {
        return (
            <LoadingScreen
                message="Loading your dashboard..."
                size="lg"
            />
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthenticatedHeader pageTitle="Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
                    </h1>
                    <p className="text-gray-600">
                        Choose a track to start practicing your speaking skills
                    </p>
                </div>

                {/* Resume Practice Button */}
                {Object.keys(userProgress).length > 0 && (
                    <div className="mb-6">
                        <button
                            onClick={handleResumePractice}
                            className={`${COLORS.primary.yellow.gradient} ${COLORS.primary.yellow.textDark} px-6 py-3 rounded-lg ${COLORS.primary.yellow.gradientHover} transition-all duration-300 font-bold flex items-center space-x-2 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105`}
                        >
                            <Play className="w-5 h-5" />
                            <span>Resume Practice</span>
                        </button>
                    </div>
                )}

                {/* Featured Track Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">🎯 Start with JAM</h2>
                                <p className="text-slate-700">
                                    Perfect for beginners! Practice speaking on various topics for exactly one minute.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <Mic className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/tracks/jam/practice"
                                className={`${COLORS.primary.yellow.gradient} ${COLORS.primary.yellow.textDark} px-6 py-3 rounded-lg ${COLORS.primary.yellow.gradientHover} transition-all duration-300 font-bold flex items-center justify-center space-x-2 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105`}
                            >
                                <Play className="w-5 h-5" />
                                <span>Start JAM Practice</span>
                            </Link>
                            <Link
                                to="/tracks/jam"
                                className="px-6 py-3 border-2 border-yellow-400 text-yellow-700 rounded-lg font-bold hover:bg-yellow-50 transition-all duration-300 flex items-center justify-center"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Track Selection Grid */}
                <div className="mb-12">
                    <TrackGrid
                        tracks={TRACKS}
                        userProgress={userProgress}
                        showProgress={true}
                    />
                </div>

                {/* Quick Stats Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Your Progress</h2>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/jam-feedback"
                                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Get Feedback
                            </Link>
                            <Link
                                to="/analytics"
                                className="text-slate-700 hover:text-slate-900 text-sm font-medium"
                            >
                                View Detailed Analytics
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link to="/analytics/recordings" className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Recordings</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.totalRecordings}</p>
                            </div>
                            <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center">
                                <Mic className="w-6 h-6 text-sky-600" />
                            </div>
                        </Link>

                        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Practice Time</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {formatTime(stats.totalPracticeTime)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average Score</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}/10` : <NotRatedYet />}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Last Practice</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stats.lastPracticeDate ?
                                        new Date(stats.lastPracticeDate).toLocaleDateString() :
                                        'Never'
                                    }
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
                        <Link
                            to="/analytics"
                            className="text-slate-700 hover:text-slate-900 text-sm font-medium"
                        >
                            View All
                        </Link>
                    </div>

                    {stats.lastPracticeDate ? (
                        <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                                <Target className="w-5 h-5 text-sky-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">Practice Session</p>
                                <p className="text-sm text-gray-600">
                                    {new Date(stats.lastPracticeDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">
                                    Duration: {formatTime(stats.totalPracticeTime)}
                                </p>
                                <Link
                                    to="/jam-feedback"
                                    className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                                >
                                    View Feedback
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No recent activity</p>
                            <p className="text-sm text-gray-500">Start practicing to see your activity here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 