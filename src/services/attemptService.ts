export interface AttemptCounts {
    [setName: string]: number
}

/**
 * Fetch attempt counts for a user and specific exam type 
 */
export async function getAttemptCounts(userId: string, examType: 'sbi-po' | 'ibps-po'): Promise<AttemptCounts> {
    try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${baseUrl}/api/v1/interviews/attempts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                interviewType: examType
            })
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch attempt counts: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch attempt counts')
        }

        // New optimized format: flat structure with all sets
        return data.attempts || {}
    } catch (error) {
        console.error('Error fetching attempt counts:', error)
        // Return empty counts if API fails - graceful degradation
        return {}
    }
}
