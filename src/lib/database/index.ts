// Database operations for Courage App
// This file contains all database-related functions

import { supabase } from '../supabase'
import type {
    DatabaseTopic,
    TopicsQueryResult,
    TopicQueryResult,
    CreateTopicData,
    UpdateTopicData,
    JamRecording,
    JamRecordingsQueryResult,
    JamRecordingQueryResult,
    CreateJamRecordingData,
    UpdateJamRecordingData
} from './types'
import type { Topic } from '../types/track'

// Convert DatabaseTopic to Topic format for backward compatibility
const convertDatabaseTopicToTopic = (dbTopic: DatabaseTopic): Topic => ({
    id: dbTopic.id,
    title: dbTopic.title,
    category: dbTopic.category,
    description: dbTopic.description,
    trackId: dbTopic.track_id,
    difficulty: dbTopic.difficulty,
    estimatedTime: dbTopic.estimated_time,
    tags: dbTopic.tags,
    isActive: dbTopic.is_active,
    createdAt: dbTopic.created_at,
    updatedAt: dbTopic.updated_at
})

// Topics operations
export async function getTopics(trackId?: string): Promise<TopicsQueryResult> {
    try {
        let query = supabase
            .from('topics')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (trackId) {
            query = query.eq('track_id', trackId)
        }

        const { data, error, count } = await query

        return {
            data: data as DatabaseTopic[],
            error,
            count
        }
    } catch (error) {
        return {
            data: null,
            error,
            count: null
        }
    }
}

export async function getTopic(id: string): Promise<TopicQueryResult> {
    try {
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('id', id)
            .single()

        return {
            data: data as DatabaseTopic,
            error
        }
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}

export async function createTopic(topicData: CreateTopicData): Promise<TopicQueryResult> {
    try {
        const { data, error } = await supabase
            .from('topics')
            .insert([topicData])
            .select()
            .single()

        return {
            data: data as DatabaseTopic,
            error
        }
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}

export async function updateTopic(id: string, topicData: UpdateTopicData): Promise<TopicQueryResult> {
    try {
        const { data, error } = await supabase
            .from('topics')
            .update(topicData)
            .eq('id', id)
            .select()
            .single()

        return {
            data: data as DatabaseTopic,
            error
        }
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}

export async function deleteTopic(id: string): Promise<{ error: any }> {
    try {
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id)

        return { error }
    } catch (error) {
        return { error }
    }
}

// Topic helper functions (converted from topics.ts)
export const getTopicsByTrack = async (trackId: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('track_id', trackId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching topics by track:', error)
        return []
    }

    return (data || []).map(convertDatabaseTopicToTopic)
}

export const getTopicsByDifficulty = async (difficulty: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .order('title', { ascending: true })

    if (error) {
        console.error('Error fetching topics by difficulty:', error)
        return []
    }

    return (data || []).map(convertDatabaseTopicToTopic)
}

export const getTopicsByCategory = async (category: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('title', { ascending: true })

    if (error) {
        console.error('Error fetching topics by category:', error)
        return []
    }

    return (data || []).map(convertDatabaseTopicToTopic)
}

export const searchTopics = async (query: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('title', { ascending: true })

    if (error) {
        console.error('Error searching topics:', error)
        return []
    }

    return (data || []).map(convertDatabaseTopicToTopic)
}

export const getTopicById = async (topicId: string): Promise<Topic | null> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single()

    if (error) {
        console.error('Error fetching topic by ID:', error)
        return null
    }

    return data ? convertDatabaseTopicToTopic(data) : null
}

export const getTopicsByTrackAndDifficulty = async (
    trackId: string,
    difficulty: string
): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('track_id', trackId)
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .order('title', { ascending: true })

    if (error) {
        console.error('Error fetching topics by track and difficulty:', error)
        return []
    }

    return (data || []).map(convertDatabaseTopicToTopic)
}

export const getAllActiveTopics = async (): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching all active topics:', error)
        return []
    }

    return (data || []).map(convertDatabaseTopicToTopic)
}

export const toggleTopicStatus = async (topicId: string): Promise<TopicQueryResult> => {
    // First get current status
    const currentTopic = await getTopicById(topicId)
    if (!currentTopic) {
        return { data: null, error: new Error('Topic not found') }
    }

    const { data, error } = await supabase
        .from('topics')
        .update({
            is_active: !currentTopic.isActive,
            updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .select()
        .single()

    return { data, error }
}

// JAM Recordings operations
export async function getJamRecordings(userId: string): Promise<JamRecordingsQueryResult> {
    try {
        const { data, error, count } = await supabase
            .from('jam_recordings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        return {
            data: data as JamRecording[],
            error,
            count
        }
    } catch (error) {
        return {
            data: null,
            error,
            count: null
        }
    }
}

export async function getJamRecording(id: string): Promise<JamRecordingQueryResult> {
    try {
        const { data, error } = await supabase
            .from('jam_recordings')
            .select('*')
            .eq('id', id)
            .single()

        return {
            data: data as JamRecording,
            error
        }
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}

export async function createJamRecording(recordingData: CreateJamRecordingData): Promise<JamRecordingQueryResult> {
    try {
        const { data, error } = await supabase
            .from('jam_recordings')
            .insert([recordingData])
            .select()
            .single()

        return {
            data: data as JamRecording,
            error
        }
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}

export async function updateJamRecording(id: string, recordingData: UpdateJamRecordingData): Promise<JamRecordingQueryResult> {
    try {
        const { data, error } = await supabase
            .from('jam_recordings')
            .update(recordingData)
            .eq('id', id)
            .select()
            .single()

        return {
            data: data as JamRecording,
            error
        }
    } catch (error) {
        return {
            data: null,
            error
        }
    }
}

export async function deleteJamRecording(id: string): Promise<{ error: any }> {
    try {
        const { error } = await supabase
            .from('jam_recordings')
            .delete()
            .eq('id', id)

        return { error }
    } catch (error) {
        return { error }
    }
} 