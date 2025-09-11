import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import ResultsView from '../components/StreamingInterview/ResultsView';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../lib/auth-context';

interface InterviewResultsData {
    questions: string[];
    answers: string[];
    sessionId: string;
    evaluation?: any; // Add evaluation data
}

const InterviewResults: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [resultsData, setResultsData] = useState<InterviewResultsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID provided');
            setIsLoading(false);
            return;
        }

        // Fetch feedback from database (since session might be expired)
        const fetchResults = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL;

                // First try to get feedback from database
                const feedbackResponse = await fetch(`${baseUrl}/api/v1/feedback/${sessionId}`);

                if (feedbackResponse.ok) {
                    const feedbackData = await feedbackResponse.json();
                    if (feedbackData.success && feedbackData.feedback) {
                        // Extract questions and answers from feedback data
                        const feedback = feedbackData.feedback.feedback_data;
                        const questions = feedback.qa_feedback.map((qa: any) => qa.question);
                        const answers = feedback.qa_feedback.map((qa: any) => qa.answer);

                        setResultsData({
                            questions: questions,
                            answers: answers,
                            sessionId: sessionId,
                            evaluation: feedback // Pass the full evaluation data
                        });
                        return;
                    }
                }

                // If no feedback found, try to get from session (fallback)
                console.log('No database feedback found, trying session fallback...');
                const sessionResponse = await fetch(`${baseUrl}/api/v1/get-interview-results/${sessionId}`);
                console.log('Session response status:', sessionResponse.status);

                if (!sessionResponse.ok) {
                    if (sessionResponse.status === 404) {
                        console.log('Session not found, generating new evaluation...');
                        // Session expired, generate new evaluation
                        const evaluationResponse = await fetch(`${baseUrl}/api/v1/evaluate-interview`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                sessionId,
                                candidateId: 'CAND123',
                                interviewSet: 'Set1',
                                context: 'sbi-po',
                                userId: user?.id
                            }),
                        });

                        if (!evaluationResponse.ok) {
                            throw new Error(`Failed to generate evaluation: ${evaluationResponse.status}`);
                        }

                        const evaluationData = await evaluationResponse.json();
                        if (evaluationData.success && evaluationData.evaluation) {
                            const evaluation = evaluationData.evaluation;
                            const questions = evaluation.qa_feedback.map((qa: any) => qa.question);
                            const answers = evaluation.qa_feedback.map((qa: any) => qa.answer);

                            setResultsData({
                                questions: questions,
                                answers: answers,
                                sessionId: sessionId,
                                evaluation: evaluation
                            });
                            return;
                        } else {
                            throw new Error(evaluationData.error || 'Failed to generate evaluation');
                        }
                    }
                    throw new Error(`Failed to fetch results: ${sessionResponse.status}`);
                }

                const data = await sessionResponse.json();
                console.log('Session data received:', data);

                if (data.success && data.results) {
                    console.log('Session data found, but no DB evaluation - generating evaluation...');
                    // Session data exists but no DB evaluation, generate and store it
                    const evaluationResponse = await fetch(`${baseUrl}/api/v1/evaluate-interview`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId,
                            candidateId: 'CAND123',
                            interviewSet: 'Set1',
                            context: 'sbi-po',
                            userId: user?.id
                        }),
                    });

                    if (!evaluationResponse.ok) {
                        throw new Error(`Failed to generate evaluation: ${evaluationResponse.status}`);
                    }

                    const evaluationData = await evaluationResponse.json();
                    if (evaluationData.success && evaluationData.evaluation) {
                        const evaluation = evaluationData.evaluation;
                        const questions = evaluation.qa_feedback.map((qa: any) => qa.question);
                        const answers = evaluation.qa_feedback.map((qa: any) => qa.answer);

                        setResultsData({
                            questions: questions,
                            answers: answers,
                            sessionId: sessionId,
                            evaluation: evaluation
                        });
                        return;
                    } else {
                        throw new Error(evaluationData.error || 'Failed to generate evaluation');
                    }
                } else {
                    console.log('Session data invalid, generating evaluation...');
                    // Session data is invalid, generate new evaluation
                    const evaluationResponse = await fetch(`${baseUrl}/api/v1/evaluate-interview`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId,
                            candidateId: 'CAND123',
                            interviewSet: 'Set1',
                            context: 'sbi-po',
                            userId: user?.id
                        }),
                    });

                    if (!evaluationResponse.ok) {
                        throw new Error(`Failed to generate evaluation: ${evaluationResponse.status}`);
                    }

                    const evaluationData = await evaluationResponse.json();
                    if (evaluationData.success && evaluationData.evaluation) {
                        const evaluation = evaluationData.evaluation;
                        const questions = evaluation.qa_feedback.map((qa: any) => qa.question);
                        const answers = evaluation.qa_feedback.map((qa: any) => qa.answer);

                        setResultsData({
                            questions: questions,
                            answers: answers,
                            sessionId: sessionId,
                            evaluation: evaluation
                        });
                        return;
                    } else {
                        throw new Error(evaluationData.error || 'Failed to generate evaluation');
                    }
                }
            } catch (err) {
                console.error('Error fetching results:', err);
                setError(err instanceof Error ? err.message : 'Failed to load interview results');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [sessionId]);

    const handleStartNewInterview = () => {
        navigate('/sbi-po');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    if (isLoading) {
        return (
            <LoadingScreen
                message="Loading your interview results..."
                size="lg"
            />
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-800 mb-4">Unable to Load Results</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <div className="space-x-4">
                            <button
                                onClick={handleBackToDashboard}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={handleStartNewInterview}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Start New Interview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!resultsData) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="text-gray-600">No results data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with navigation */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h1 className="text-3xl font-bold text-gray-900">Interview Results</h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleStartNewInterview}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Start New Interview
                        </button>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Session ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{sessionId}</span>
                </div>
            </div>

            {/* Results View */}
            <ResultsView
                questions={resultsData.questions}
                answers={resultsData.answers}
                sessionId={resultsData.sessionId}
                evaluation={resultsData.evaluation}
            />
        </div>
    );
};

export default InterviewResults;
