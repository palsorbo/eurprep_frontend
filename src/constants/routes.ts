// Route constants for better maintainability
export const ROUTES = {
    DASHBOARD: '/dashboard',
    SBI_PO: '/sbi-po',
    RESULTS: '/results',
    RESULTS_WITH_FEEDBACK_ID: (feedbackId: string) => `/results/${feedbackId}`,
} as const;

// API endpoint constants
export const API_ENDPOINTS = {
    FEEDBACK_BY_ID: (feedbackId: string) => `/api/v1/feedback/id/${feedbackId}`,
    RESULT_BY_SESSION_ID: (sessionId: string) => `/api/v1/result/${sessionId}`,
} as const;
