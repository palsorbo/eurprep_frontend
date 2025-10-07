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
    // Attempt tracking fields
    attemptCount?: number
    maxAttempts?: number
    isAttemptLimitReached?: boolean
}

// SBI PO Interview Sets
export const SBI_PO_SETS: InterviewSet[] = [
    {
        id: 1,
        name: "Try for Free",
        description: "Try out this demo set and see how our intelligent system evaluates your response - completely free!",
        questions: 1,
        isFree: true,
        isAvailable: true,
        path: "/sbi-po/interview/1",
        examType: 'sbi-po'
    },
    {
        id: 2,
        name: "Basic",
        description: "Build interview confidence with essential questions. Get instant intelligent feedback on your answers to improve your communication skills and interview technique.",
        questions: 10,
        isFree: false,
        isAvailable: true,
        path: "/sbi-po/interview/2",
        examType: 'sbi-po'
    },
    {
        id: 3,
        name: "Intermediate",
        description: "Master complex banking scenarios with advanced questions on customer service, leadership, and market awareness. Receive detailed intelligent analysis to perfect your problem-solving approach.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/sbi-po/interview/3",
        examType: 'sbi-po'
    },
    {
        id: 4,
        name: "Advance",
        description: "Excel at the highest level with expert questions on banking regulations, risk management, and complex case studies. Get comprehensive intelligent evaluation to match real interview standards.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/sbi-po/interview/4",
        examType: 'sbi-po'
    }
]

// IBPS PO Interview Sets
export const IBPS_PO_SETS: InterviewSet[] = [
    {
        id: 1,
        name: "Try for Free",
        description: "Try out this set and see how our intelligent system evaluates your response - completely free!",
        questions: 1,
        isFree: true,
        isAvailable: true,
        path: "/ibps-po/interview/1",
        examType: 'ibps-po'
    },
    {
        id: 2,
        name: "Basic",
        description: "Build interview confidence with  essential  questions. Get instant intelligent feedback on your answers to improve your communication skills and interview technique.",
        questions: 10,
        isFree: false,
        isAvailable: true,
        path: "/ibps-po/interview/2",
        examType: 'ibps-po'
    },
    {
        id: 3,
        name: "Intermediate",
        description: "Master complex banking scenarios with advanced questions on customer service, leadership, and market awareness. Receive detailed intelligent analysis to perfect your problem-solving approach.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/ibps-po/interview/3",
        examType: 'ibps-po'
    },
    {
        id: 4,
        name: "Advance",
        description: "Excel at the highest level with expert questions on banking regulations, risk management, and complex case studies. Get comprehensive intelligent evaluation to match real interview standards.",
        questions: 10,
        isFree: false,
        isAvailable: false,
        path: "/ibps-po/interview/4",
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
