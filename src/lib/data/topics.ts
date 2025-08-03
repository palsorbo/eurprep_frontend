// Re-export database functions for backward compatibility
export {
    getTopicsByTrack,
    getTopicsByDifficulty,
    searchTopics,
    getTopicsByCategory,
    getTopicById,
    getTopicsByTrackAndDifficulty,
    getAllActiveTopics
} from '../database' 