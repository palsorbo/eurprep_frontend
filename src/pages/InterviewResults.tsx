import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import ResultsView from '../components/StreamingInterview/ResultsView';
import LoadingScreen from '../components/LoadingScreen';

interface InterviewResultsData {
    questions: string[];
    answers: string[];
    sessionId: string;
}

const InterviewResults: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [resultsData, setResultsData] = useState<InterviewResultsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID provided');
            setIsLoading(false);
            return;
        }

        // Fetch interview results from backend
        const fetchResults = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_BASE_URL;
                const response = await fetch(`${baseUrl}/api/v1/get-interview-results/${sessionId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Interview session not found or expired');
                    }
                    throw new Error(`Failed to fetch results: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.results) {
                    setResultsData({
                        questions: data.results.questions,
                        answers: data.results.answers,
                        sessionId: sessionId
                    });
                } else {
                    throw new Error(data.error || 'Failed to load interview results');
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
            />
        </div>
    );
};

export default InterviewResults;
