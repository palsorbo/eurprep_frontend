import { useState, useEffect, useCallback, useRef } from 'react';

export interface InterviewResultsData {
    questions: string[];
    answers: string[];
    evaluation: any; // Using any to match the existing ResultsView component interface
}

interface UseInterviewResultsProps {
    feedbackId?: string;
    sessionId?: string;
}

interface UseInterviewResultsReturn {
    resultsData: InterviewResultsData | null;
    isLoading: boolean;
    error: string | null;
}

export const useInterviewResults = ({
    feedbackId,
    sessionId
}: UseInterviewResultsProps): UseInterviewResultsReturn => {
    const [resultsData, setResultsData] = useState<InterviewResultsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastFetchParams = useRef<string>('');

    const fetchResults = useCallback(async () => {
        // Check if we have either feedbackId or sessionId
        if (!feedbackId && !sessionId) {
            setError('No feedback ID or session ID provided');
            setIsLoading(false);
            return;
        }

        // Check if we've already fetched for these parameters
        const currentParams = `${feedbackId || ''}-${sessionId || ''}`;
        if (lastFetchParams.current === currentParams) {
            return;
        }

        try {
            lastFetchParams.current = currentParams;

            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            let response: Response;

            if (feedbackId) {
            // Fetch existing feedback by feedbackId
                response = await fetch(`${baseUrl}/api/v1/feedback/id/${feedbackId}`);
            } else {
                // Generate new feedback by sessionId
                response = await fetch(`${baseUrl}/api/v1/result/${sessionId}`);
            }


            if (response.ok) {
                const data = await response.json();

                if (data.success && data.feedback) {
                    const feedback = data.feedback.feedback_data;
                    const questions = feedback.qa_feedback.map((qa: any) => qa.question);
                    const answers = feedback.qa_feedback.map((qa: any) => qa.answer);

                    setResultsData({
                        questions,
                        answers,
                        evaluation: feedback
                    });
                    return;
                } else {
                }
            }

            if (response.status === 404) {
                const errorMsg = feedbackId
                    ? 'Feedback not found. The feedback may have been deleted or the link is invalid.'
                    : 'Interview session not found. The session may have expired.';
                throw new Error(errorMsg);
            } else if (response.status === 400) {
                const errorMsg = feedbackId
                    ? 'Invalid feedback ID provided.'
                    : 'Feedback not available for this session. Please try again later.';
                throw new Error(errorMsg);
            } else {
                throw new Error(`Failed to fetch results: ${response.status}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load interview results');
        } finally {
            setIsLoading(false);
        }
    }, [feedbackId, sessionId]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    return { resultsData, isLoading, error };
};
