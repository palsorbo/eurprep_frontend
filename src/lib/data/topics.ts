import type { Topic } from '../types/track'

// JAM Track Topics
const JAM_TOPICS: Topic[] = [
    {
        id: 'jam-1',
        title: 'Digital Transformation in Business',
        category: 'Technology',
        description: 'Discuss how digital transformation is reshaping traditional business models and what it means for future leaders.',
        trackId: 'jam',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['technology', 'business', 'digital'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-2',
        title: 'Remote Work Culture',
        category: 'Workplace',
        description: 'Share your thoughts on the future of remote work and its impact on team collaboration and productivity.',
        trackId: 'jam',
        difficulty: 'beginner',
        estimatedTime: 60,
        tags: ['workplace', 'remote-work', 'collaboration'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-3',
        title: 'Climate Change and Corporate Responsibility',
        category: 'Environment',
        description: 'How should businesses balance profit with environmental responsibility in today\'s climate-conscious world?',
        trackId: 'jam',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['environment', 'corporate', 'sustainability'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-4',
        title: 'Artificial Intelligence in Healthcare',
        category: 'Technology',
        description: 'Discuss the potential benefits and challenges of AI integration in healthcare systems.',
        trackId: 'jam',
        difficulty: 'advanced',
        estimatedTime: 60,
        tags: ['technology', 'healthcare', 'ai'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-5',
        title: 'Current Economic Policies',
        category: 'Economics',
        description: 'Analyze recent economic policies and their impact on different sectors of the economy.',
        trackId: 'jam',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['economics', 'policies', 'finance'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-6',
        title: 'Cybersecurity in the Digital Age',
        category: 'Technology',
        description: 'How should organizations approach cybersecurity in an increasingly connected world?',
        trackId: 'jam',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['technology', 'cybersecurity', 'digital'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-7',
        title: 'Social Media and Mental Health',
        category: 'Health',
        description: 'Discuss the impact of social media on mental health and well-being in modern society.',
        trackId: 'jam',
        difficulty: 'beginner',
        estimatedTime: 60,
        tags: ['health', 'social-media', 'mental-health'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-8',
        title: 'Education in the Digital Era',
        category: 'Education',
        description: 'How should education systems adapt to prepare students for the digital future?',
        trackId: 'jam',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['education', 'digital', 'future'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-9',
        title: 'Work-Life Balance in Modern Times',
        category: 'Lifestyle',
        description: 'How can professionals maintain a healthy work-life balance in today\'s fast-paced world?',
        trackId: 'jam',
        difficulty: 'beginner',
        estimatedTime: 60,
        tags: ['lifestyle', 'work-life-balance', 'wellness'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'jam-10',
        title: 'The Future of Electric Vehicles',
        category: 'Technology',
        description: 'Discuss the challenges and opportunities in the transition to electric vehicles.',
        trackId: 'jam',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['technology', 'electric-vehicles', 'sustainability'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
]

// IBPS PO Track Topics (Coming Soon)
const IBPS_PO_TOPICS: Topic[] = [
    {
        id: 'ibps-1',
        title: 'Current Banking Trends',
        category: 'Banking',
        description: 'Discuss recent trends in the banking sector and their implications.',
        trackId: 'ibps-po',
        difficulty: 'intermediate',
        estimatedTime: 60,
        tags: ['banking', 'trends', 'finance'],
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
]

// HR Freshers Track Topics (Coming Soon)
const HR_FRESHERS_TOPICS: Topic[] = [
    {
        id: 'hr-1',
        title: 'Tell Me About Yourself',
        category: 'Introduction',
        description: 'Practice the classic interview question with confidence.',
        trackId: 'hr-freshers',
        difficulty: 'beginner',
        estimatedTime: 60,
        tags: ['introduction', 'self-presentation', 'confidence'],
        isActive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
]

// All topics combined
export const ALL_TOPICS: Topic[] = [
    ...JAM_TOPICS,
    ...IBPS_PO_TOPICS,
    ...HR_FRESHERS_TOPICS
]

// Helper functions
export const getTopicsByTrack = (trackId: string): Topic[] => {
    return ALL_TOPICS.filter(topic => topic.trackId === trackId && topic.isActive)
}

export const getTopicsByCategory = (category: string): Topic[] => {
    return ALL_TOPICS.filter(topic => topic.category === category && topic.isActive)
}

export const getTopicsByDifficulty = (difficulty: string): Topic[] => {
    return ALL_TOPICS.filter(topic => topic.difficulty === difficulty && topic.isActive)
}

export const getTopicById = (topicId: string): Topic | undefined => {
    return ALL_TOPICS.find(topic => topic.id === topicId)
}

export const getActiveTopics = (): Topic[] => {
    return ALL_TOPICS.filter(topic => topic.isActive)
}

export const getTopicsByTrackAndDifficulty = (trackId: string, difficulty: string): Topic[] => {
    return ALL_TOPICS.filter(topic =>
        topic.trackId === trackId &&
        topic.difficulty === difficulty &&
        topic.isActive
    )
}

export const searchTopics = (query: string): Topic[] => {
    const lowercaseQuery = query.toLowerCase()
    return ALL_TOPICS.filter(topic =>
        topic.isActive && (
            topic.title.toLowerCase().includes(lowercaseQuery) ||
            topic.description.toLowerCase().includes(lowercaseQuery) ||
            topic.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
    )
} 