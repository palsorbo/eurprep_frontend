import React, { useState } from 'react';

interface QaFeedback {
    question: string;
    answer: string;
    feedback: string;
}

interface OverallFeedback {
    summary: string;
    recommendation: 'Recommended' | 'Recommended with improvements' | 'Not Recommended';
}

interface InterviewEvaluation {
    candidate_id: string;
    interview_set: string;
    version: string;
    qa_feedback: QaFeedback[];
    overall_feedback: OverallFeedback;
}

interface ResultsViewProps {
    questions: string[];
    answers: string[];
    sessionId?: string;
    apiUrl?: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, answers, sessionId, apiUrl }) => {
    const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'Recommended':
                return 'text-green-600 bg-green-100';
            case 'Recommended with improvements':
                return 'text-yellow-600 bg-yellow-100';
            case 'Not Recommended':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const evaluateInterview = async () => {
        if (!sessionId) {
            setError('Session ID not available for evaluation');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const baseUrl = apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
            const response = await fetch(`${baseUrl}/api/v1/evaluate-interview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    candidateId: 'CAND123',
                    interviewSet: 'SBI_SET1'
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setEvaluation(data.evaluation);
            } else {
                setError(data.error || 'Failed to evaluate interview');
            }
        } catch (err) {
            setError('Network error occurred while evaluating interview');
            console.error('Evaluation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Interview Results</h2>
                {sessionId && !evaluation && (
                    <button
                        onClick={evaluateInterview}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {isLoading ? 'Evaluating...' : 'Get AI Evaluation'}
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Overall Evaluation Summary */}
            {evaluation && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">AI Evaluation Summary</h3>
                    <div className="mb-4">
                        <p className="text-gray-700 mb-2">
                            <span className="font-semibold">Summary:</span> {evaluation.overall_feedback.summary}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Recommendation:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(evaluation.overall_feedback.recommendation)}`}>
                                {evaluation.overall_feedback.recommendation}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Q&A with Feedback */}
            <div className="space-y-6">
                {questions.map((question, index) => {
                    const qaFeedback = evaluation?.qa_feedback.find(
                        qa => qa.question === question
                    );

                    return (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-800 mb-2">
                                    Question {index + 1}:
                                </h3>
                                <p className="text-gray-700 mb-3">{question}</p>

                                <h3 className="font-semibold text-gray-800 mb-2">Your Answer:</h3>
                                <p className="text-gray-700 mb-3">
                                    {answers[index] || 'No answer recorded'}
                                </p>
                            </div>

                            {/* AI Feedback */}
                            {qaFeedback && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                    <h4 className="font-semibold text-blue-800 mb-2">AI Feedback:</h4>
                                    <p className="text-blue-700">{qaFeedback.feedback}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Re-evaluate button */}
            {evaluation && sessionId && (
                <div className="mt-6 text-center">
                    <button
                        onClick={evaluateInterview}
                        disabled={isLoading}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {isLoading ? 'Re-evaluating...' : 'Re-evaluate Interview'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsView;
