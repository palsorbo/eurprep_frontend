

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Home } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import TopicGrid from '../components/tracks/TopicGrid'
import { getTrackById } from '../lib/data/tracks'
import { getTopicsByTrack } from '../lib/data/topics'
import type { Track, Topic } from '../lib/types/track'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'

export default function TrackPractice() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null)
    const [track, setTrack] = useState<Track | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
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

        // Get topics for this track
        const trackTopics = getTopicsByTrack(trackId)
        setTopics(trackTopics)

        setLoading(false)
    }, [params.trackId, navigate])

    const checkUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            navigate('/app/login')
            return
        }
        setUser(user as unknown as Record<string, unknown>)
    }, [navigate])

    useEffect(() => {
        checkUser()
    }, [checkUser])

    // Breadcrumb items
    const getBreadcrumbItems = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [
            { label: 'Dashboard', href: '/app', icon: Home }
        ]

        if (track) {
            items.push({
                label: track.title,
                href: `/app/tracks/${track.id}/practice`
            })
        }

        return items
    }

    if (loading || !user || !track) {
        return (
            <LoadingScreen
                message="Loading..."
                size="md"
            />
        )
    }

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
                <div>
                    <div className="text-center mb-8">
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {track.description}
                        </p>
                    </div>

                    <TopicGrid
                        topics={topics}
                        trackId={params.trackId as string}

                    />
                </div>
            </div>
        </div>
    )
} 