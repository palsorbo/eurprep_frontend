import React from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Search, Clock, AlertTriangle } from 'lucide-react';
import ResultsView from '../components/StreamingInterview/ResultsView';
import LoadingScreen from '../components/LoadingScreen';
import { useInterviewResults } from '../hooks/useInterviewResults';

const InterviewResults: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId } = location.state || {};
    const { feedbackId } = useParams<{ feedbackId: string }>();

    const { resultsData, isLoading, error } = useInterviewResults({ feedbackId, sessionId });

    const handleStartNewInterview = () => {
        navigate('/sbi-po');
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
        const isFeedbackNotFound = error.includes('Feedback not found');
        const isSessionNotFound = error.includes('Session not found');

        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <div className="flex justify-center mb-4">
                            {isFeedbackNotFound ? (
                                <Search className="w-16 h-16 text-red-600" />
                            ) : isSessionNotFound ? (
                                <Clock className="w-16 h-16 text-red-600" />
                            ) : (
                                <AlertTriangle className="w-16 h-16 text-red-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-red-800 mb-4">
                            {isFeedbackNotFound ? 'Feedback Not Found' :
                                isSessionNotFound ? 'Session Expired' :
                                    'Unable to Load Results'}
                        </h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry to get results
                        </button>

                        {/* <div className="space-x-4">
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
                        </div> */}
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry
                        </button>
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
                {/* <div className="flex items-center justify-between">
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
                </div> */}

            </div>

            {/* Results View */}
            <ResultsView
                questions={resultsData.questions}
                answers={resultsData.answers}
                evaluation={resultsData.evaluation}
            />
        </div>
    );
};

export default InterviewResults;
