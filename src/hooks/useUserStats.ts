import { useState, useEffect } from 'react'
import { useRecordings, type Recording } from './useRecordings'
import { useUserProgress } from './useUserProgress'

export interface UserStats {
    totalRecordings: number
    totalPracticeTime: number
    averageScore: number
    lastPracticeDate: string | null
    totalTopicsCompleted: number
    currentStreak: number
    achievements: string[]
    weeklyProgress: {
        date: string
        recordings: number
        practiceTime: number
    }[]
}

export interface UseUserStatsReturn {
    stats: UserStats
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useUserStats(): UseUserStatsReturn {
    const { recordings, loading: recordingsLoading, error: recordingsError } = useRecordings()
    const { progress, loading: progressLoading, error: progressError } = useUserProgress()

    const [stats, setStats] = useState<UserStats>({
        totalRecordings: 0,
        totalPracticeTime: 0,
        averageScore: 0,
        lastPracticeDate: null,
        totalTopicsCompleted: 0,
        currentStreak: 0,
        achievements: [],
        weeklyProgress: []
    })

    const calculateStats = () => {
        // Calculate total recordings and practice time
        const totalRecordings = recordings.length
        const totalPracticeTime = recordings.reduce((acc, rec) => acc + (rec.duration_seconds || 0), 0)

        // Calculate average score from recordings with feedback
        const recordingsWithScores = recordings.filter(rec => {
            const feedback = rec.feedback_data as { score?: number } | undefined
            return feedback?.score !== undefined
        })
        const averageScore = recordingsWithScores.length > 0
            ? recordingsWithScores.reduce((acc, rec) => {
                const feedback = rec.feedback_data as { score?: number }
                return acc + (feedback.score || 0)
            }, 0) / recordingsWithScores.length
            : 0

        // Get last practice date
        const lastPracticeDate = recordings.length > 0 ? recordings[0].created_at : null

        // Calculate total topics completed
        const totalTopicsCompleted = Object.values(progress).reduce((acc, prog) => acc + (prog.completedTopics || 0), 0)

        // Calculate current streak (simplified - could be enhanced)
        const currentStreak = Object.values(progress).reduce((acc, prog) => Math.max(acc, prog.streakDays || 0), 0)

        // Collect all achievements
        const allAchievements = Object.values(progress).flatMap(prog => prog.achievements || [])
        const uniqueAchievements = [...new Set(allAchievements)]

        // Calculate weekly progress (last 7 days)
        const weeklyProgress = calculateWeeklyProgress(recordings)

        setStats({
            totalRecordings,
            totalPracticeTime,
            averageScore,
            lastPracticeDate,
            totalTopicsCompleted,
            currentStreak,
            achievements: uniqueAchievements,
            weeklyProgress
        })
    }

    const calculateWeeklyProgress = (recordings: Recording[]) => {
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const weeklyData: { [key: string]: { recordings: number; practiceTime: number } } = {}

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const dateKey = date.toISOString().split('T')[0]
            weeklyData[dateKey] = { recordings: 0, practiceTime: 0 }
        }

        // Fill in actual data
        recordings.forEach(recording => {
            const recordingDate = new Date(recording.created_at)
            if (recordingDate >= weekAgo) {
                const dateKey = recordingDate.toISOString().split('T')[0]
                if (weeklyData[dateKey]) {
                    weeklyData[dateKey].recordings += 1
                    weeklyData[dateKey].practiceTime += recording.duration_seconds || 0
                }
            }
        })

        return Object.entries(weeklyData).map(([date, data]) => ({
            date,
            recordings: data.recordings,
            practiceTime: data.practiceTime
        }))
    }

    useEffect(() => {
        if (!recordingsLoading && !progressLoading) {
            calculateStats()
        }
    }, [recordings, progress, recordingsLoading, progressLoading])

    return {
        stats,
        loading: recordingsLoading || progressLoading,
        error: recordingsError || progressError,
        refetch: () => {
            // This will trigger recalculation when dependencies change
        }
    }
} 