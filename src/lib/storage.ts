// Storage utilities for Courage App
// This file contains functions for handling Supabase Storage operations

import { supabase } from './supabase'

export interface StorageUploadResult {
    path: string
    url: string
    error?: string
}

/**
 * Upload audio file to Supabase Storage
 * @param path - Storage path (e.g., 'jam-recordings/user-id/recording-id.wav')
 * @param blob - Audio blob to upload
 * @returns Promise with upload result
 */
export async function uploadToStorage(path: string, blob: Blob): Promise<StorageUploadResult> {
    try {
        const { data, error } = await supabase.storage
            .from('jam-recordings')
            .upload(path, blob, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            return {
                path: '',
                url: '',
                error: error.message
            }
        }

        // Get signed URL for private bucket
        const { data: urlData, error: urlError } = await supabase.storage
            .from('jam-recordings')
            .createSignedUrl(data.path, 3600) // 1 hour expiry

        if (urlError) {
            return {
                path: data.path,
                url: '',
                error: urlError.message
            }
        }

        return {
            path: data.path,
            url: urlData.signedUrl
        }
    } catch (error) {
        return {
            path: '',
            url: '',
            error: error instanceof Error ? error.message : 'Upload failed'
        }
    }
}

/**
 * Delete audio file from Supabase Storage
 * @param path - Storage path to delete
 * @returns Promise with deletion result
 */
export async function deleteFromStorage(path: string): Promise<{ error?: string }> {
    try {
        const { error } = await supabase.storage
            .from('jam-recordings')
            .remove([path])

        return { error: error?.message }
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Deletion failed' }
    }
}

/**
 * Get signed URL for a storage file (for private buckets)
 * @param path - Storage path
 * @returns Promise with signed URL
 */
export async function getStorageUrl(path: string): Promise<string> {
    try {
        const { data, error } = await supabase.storage
            .from('jam-recordings')
            .createSignedUrl(path, 3600) // 1 hour expiry

        if (error) {
            console.error('Error creating signed URL:', error)
            return ''
        }

        return data.signedUrl
    } catch (error) {
        console.error('Error getting storage URL:', error)
        return ''
    }
}

/**
 * Generate storage path for JAM recording
 * @param userId - User ID
 * @param recordingId - Recording ID
 * @returns Storage path
 */
export function generateJamRecordingPath(userId: string, recordingId: string): string {
    return `${userId}/${recordingId}.wav`
} 