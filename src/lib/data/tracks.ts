import { Mic, Users, Briefcase, Globe, Landmark } from 'lucide-react'
import type { Track } from '../types/track'
import { COLORS } from '../constants/colors'

export const TRACKS: Track[] = [
    {
        id: 'jam',
        title: 'JAM (Just A Minute)',
        description: 'Practice speaking on various topics for exactly one minute. Perfect for improving your spontaneous speaking skills and quick thinking.',
        icon: Mic,
        status: 'active',
        color: COLORS.tracks.jam.text,
        bgColor: COLORS.tracks.jam.bg,
        topicsCount: 25,
        estimatedTime: '25 min',
        difficulty: 'beginner',
        category: 'Speaking',
        tags: ['public-speaking', 'spontaneous', 'quick-thinking', 'communication'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'ibps-po',
        title: 'IBPS PO Interview',
        description: 'Prepare for banking sector interviews with industry-specific questions, current affairs, and banking knowledge scenarios.',
        icon: Landmark,
        status: 'coming-soon',
        color: COLORS.comingSoon.icon,
        bgColor: COLORS.comingSoon.bg,
        topicsCount: 0,
        estimatedTime: 'Coming Soon',
        difficulty: 'intermediate',
        category: 'Banking',
        tags: ['banking', 'government', 'current-affairs', 'finance'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'hr-freshers',
        title: 'HR Interviews (Freshers)',
        description: 'Master common HR interview questions and behavioral scenarios specifically designed for entry-level positions and recent graduates.',
        icon: Users,
        status: 'coming-soon',
        color: COLORS.comingSoon.icon,
        bgColor: COLORS.comingSoon.bg,
        topicsCount: 0,
        estimatedTime: 'Coming Soon',
        difficulty: 'beginner',
        category: 'HR',
        tags: ['hr', 'freshers', 'behavioral', 'entry-level'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'group-discussion',
        title: 'Group Discussion',
        description: 'Practice group discussion skills with topics covering current affairs, business scenarios, and social issues.',
        icon: Users,
        status: 'coming-soon',
        color: COLORS.comingSoon.icon,
        bgColor: COLORS.comingSoon.bg,
        topicsCount: 0,
        estimatedTime: 'Coming Soon',
        difficulty: 'intermediate',
        category: 'Group',
        tags: ['group-discussion', 'teamwork', 'leadership', 'current-affairs'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'corporate-interviews',
        title: 'Corporate Interviews',
        description: 'Advanced interview preparation for experienced professionals with industry-specific scenarios and leadership questions.',
        icon: Briefcase,
        status: 'coming-soon',
        color: COLORS.comingSoon.icon,
        bgColor: COLORS.comingSoon.bg,
        topicsCount: 0,
        estimatedTime: 'Coming Soon',
        difficulty: 'advanced',
        category: 'Corporate',
        tags: ['corporate', 'leadership', 'management', 'senior-level'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'international-english',
        title: 'International English',
        description: 'Practice English communication skills for international opportunities, including accent training and cultural awareness.',
        icon: Globe,
        status: 'coming-soon',
        color: COLORS.comingSoon.icon,
        bgColor: COLORS.comingSoon.bg,
        topicsCount: 0,
        estimatedTime: 'Coming Soon',
        difficulty: 'intermediate',
        category: 'International',
        tags: ['international', 'accent', 'cultural', 'global'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
]

export const getTrackById = (id: string): Track | undefined => {
    return TRACKS.find(track => track.id === id)
}

export const getActiveTracks = (): Track[] => {
    return TRACKS.filter(track => track.status === 'active')
}

export const getComingSoonTracks = (): Track[] => {
    return TRACKS.filter(track => track.status === 'coming-soon')
}

export const getTracksByCategory = (category: string): Track[] => {
    return TRACKS.filter(track => track.category.toLowerCase() === category.toLowerCase())
}

export const getTracksByDifficulty = (difficulty: string): Track[] => {
    return TRACKS.filter(track => track.difficulty === difficulty)
} 