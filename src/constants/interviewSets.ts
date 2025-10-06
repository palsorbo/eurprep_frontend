// Unified interface for all interview sets
export interface InterviewSet {
    id: number
    name: string
    description: string
    questions: number
    isFree: boolean
    isAvailable: boolean
    path: string
    examType: 'sbi-po' | 'ibps-po'
}

// SBI PO Interview Sets
export const SBI_PO_SETS: InterviewSet[] = [
    {
        id: 0,
        name: "Try for Free",
        description: "Experience our mock interview with feedback for free",
        questions: 1,
        isFree: true,
        isAvailable: true,
        path: "/sbi-po/interview/0",
        examType: 'sbi-po'
    },
    {
        id: 1,
        name: "Basic",
        description: "Comprehensive interview set with 10 banking-specific questions covering personal, HR, and technical aspects. Get smart feedback on each answer.",
        questions: 10,
        isFree: false,
        isAvailable: true,
        path: "/sbi-po/interview/1",
        examType: 'sbi-po'
    },
    {
        id: 2,
        name: "Intermediate",
        description: "Advanced interview questions focusing on economic awareness, customer handling, and leadership scenarios with smart analysis.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/sbi-po/interview/2",
        examType: 'sbi-po'
    },
    {
        id: 3,
        name: "Advance",
        description: "Expert-level questions on banking operations, Basel norms, and complex situational scenarios with detailed smart feedback.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/sbi-po/interview/3",
        examType: 'sbi-po'
    }
]

// IBPS PO Interview Sets
export const IBPS_PO_SETS: InterviewSet[] = [
    {
        id: 0,
        name: "Try for Free",
        description: "Experience our mock interview with feedback for free",
        questions: 1,
        isFree: true,
        isAvailable: true,
        path: "/ibps-po/interview/0",
        examType: 'ibps-po'
    },
    {
        id: 1,
        name: "Basic",
        description: "Comprehensive interview set with 10 banking-specific questions covering personal, HR, and technical aspects. Get smart feedback on each answer.",
        questions: 10,
        isFree: false,
        isAvailable: true,
        path: "/ibps-po/interview/1",
        examType: 'ibps-po'
    },
    {
        id: 2,
        name: "Intermediate",
        description: "Advanced interview questions focusing on economic awareness, customer handling, and leadership scenarios with smart analysis.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/ibps-po/interview/2",
        examType: 'ibps-po'
    },
    {
        id: 3,
        name: "Advance",
        description: "Expert-level questions on banking operations, Basel norms, and complex situational scenarios with detailed smart feedback.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/ibps-po/interview/3",
        examType: 'ibps-po'
    }
]

// Combined array for when you need all sets
export const ALL_INTERVIEW_SETS: InterviewSet[] = [...SBI_PO_SETS, ...IBPS_PO_SETS]

// Helper functions
export const getInterviewSetsWithAccess = (hasPaidAccess: boolean, examType?: 'sbi-po' | 'ibps-po'): InterviewSet[] => {
    const sets = examType ? (examType === 'sbi-po' ? SBI_PO_SETS : IBPS_PO_SETS) : ALL_INTERVIEW_SETS
    return sets.map(set => ({
        ...set,
        isAvailable: set.isFree || hasPaidAccess
    }))
}

export const getSbiPoSets = (hasPaidAccess: boolean = false): InterviewSet[] => {
    return getInterviewSetsWithAccess(hasPaidAccess, 'sbi-po')
}

export const getIbpsPoSets = (hasPaidAccess: boolean = false): InterviewSet[] => {
    return getInterviewSetsWithAccess(hasPaidAccess, 'ibps-po')
}
