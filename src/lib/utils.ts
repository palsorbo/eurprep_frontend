import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format time in seconds to human-readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1 minute", "5 minutes", "<1 min")
 */
export function formatTime(seconds: number): string {
    if (seconds < 60) {
        return "<1 min"
    }

    const minutes = Math.round(seconds / 60)
    return minutes === 1 ? "1 minute" : `${minutes} minutes`
}

/**
 * Format time in seconds to compact format for display
 * @param seconds - Time in seconds
 * @returns Compact time string (e.g., "1m", "5m", "1h 30m")
 */
export function formatTimeCompact(seconds: number): string {
    if (seconds < 60) {
        return "<1m"
    }

    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
        return `${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
        return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}m`
} 