export interface InterviewSet {
    id: number
    name: string
    description: string
    questions: number
    isFree: boolean
    isAvailable: boolean
    path: string
}

export const INTERVIEW_SETS: InterviewSet[] = [
    {
        id: 0,
        name: "Set 0",
        description: "Try a sample question and see how our smart feedback works.",
        questions: 1,
        isFree: true,
        isAvailable: true, // Always available
        path: "/sbi-po/interview/0"
    },
    {
        id: 1,
        name: "Set 1",
        description: "Comprehensive interview set with 10 banking-specific questions covering personal, HR, and technical aspects. Get smart feedback on each answer.",
        questions: 10,
        isFree: true,
        isAvailable: true, // Always available
        path: "/sbi-po/interview/1"
    },
    {
        id: 2,
        name: "Set 2",
        description: "Advanced interview questions focusing on economic awareness, customer handling, and leadership scenarios with smart analysis.",
        questions: 10,
        isFree: false,
        isAvailable: false, // Will be set based on payment status
        path: "/sbi-po/interview/2"
    },
    {
        id: 3,
        name: "Set 3",
        description: "Expert-level questions on banking operations, Basel norms, and complex situational scenarios with detailed smart feedback.",
        questions: 10,
        isFree: false,
        isAvailable: false, // Will be set based on payment status
        path: "/sbi-po/interview/3"
    }
]

// Helper function to get interview sets with payment status
export const getInterviewSetsWithAccess = (hasPaidAccess: boolean): InterviewSet[] => {
    return INTERVIEW_SETS.map(set => ({
        ...set,
        isAvailable: set.isFree || hasPaidAccess
    }))
}
