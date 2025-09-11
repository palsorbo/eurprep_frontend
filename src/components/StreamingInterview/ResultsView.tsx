import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

// Enhanced feedback structure for individual questions
interface EnhancedQaFeedback {
    question: string;
    answer: string;
    category: string;
    score: number; // 0-10
    strengths: string[];
    gaps: string[];
    improvementTips: string[];
    coveredCorePoints: string[] | null;
    missedCorePoints: string[] | null;
    reflectionPrompt: string | null;
    context: string | null;
    modelAnswerReference: string | null;
    keywordsMatched: string[] | null;
    keywordsMissed: string[] | null;
}

interface OverallFeedback {
    summary: string;
    recommendation: 'Recommended' | 'Recommended with improvements' | 'Not Recommended';
    totalScore: number;
    averageScore: number;
    coveragePercentage: number;
}

interface InterviewEvaluation {
    candidate_id: string;
    interview_set: string;
    version: string;
    qa_feedback: EnhancedQaFeedback[];
    overall_feedback: OverallFeedback;
}

interface ResultsViewProps {
    questions: string[];
    answers: string[];
    sessionId?: string;
    evaluation?: InterviewEvaluation; // Optional evaluation data
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, answers, sessionId, evaluation: propEvaluation }) => {
    const { user } = useAuth();
    const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

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

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600 bg-green-100';
        if (score >= 6) return 'text-yellow-600 bg-yellow-100';
        if (score >= 4) return 'text-orange-600 bg-orange-100';
        return 'text-red-600 bg-red-100';
    };

    const toggleQuestionExpansion = (index: number) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedQuestions(newExpanded);
    };

    const renderScoreMeter = (score: number) => {
        const percentage = (score / 10) * 100;
        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${score >= 8 ? 'bg-green-500' :
                        score >= 6 ? 'bg-yellow-500' :
                            score >= 4 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        );
    };

    // Auto-evaluate when component mounts
    useEffect(() => {
    const evaluateInterview = async () => {
        // If evaluation is passed as prop, use it directly
        if (propEvaluation) {
            setEvaluation(propEvaluation);
            const allQuestionIndices = propEvaluation.qa_feedback.map((_: any, index: number) => index);
            setExpandedQuestions(new Set(allQuestionIndices));
            setIsLoading(false);
            return;
        }

        if (!sessionId) {
            setError('Session ID not available for evaluation');
            setIsLoading(false);
            return;
        }

        // Prevent duplicate calls
        if (isLoading) {
            return;
        }

        setError(null);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;

            // First, try to get existing feedback from database
            const feedbackResponse = await fetch(`${baseUrl}/api/v1/feedback/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (feedbackResponse.ok) {
                const feedbackData = await feedbackResponse.json();
                if (feedbackData.success && feedbackData.feedback) {
                    // Use existing feedback
                    setEvaluation(feedbackData.feedback.feedback_data);
                    // Auto-expand all questions for better UX
                    const allQuestionIndices = feedbackData.feedback.feedback_data.qa_feedback.map((_: any, index: number) => index);
                    setExpandedQuestions(new Set(allQuestionIndices));
                    setIsLoading(false);
                    return;
                }
            }

            // If no existing feedback, generate new evaluation
            const response = await fetch(`${baseUrl}/api/v1/evaluate-interview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    candidateId: 'CAND123',
                    interviewSet: 'Set1',
                    context: 'sbi-po',
                    userId: user?.id // Pass the actual user ID
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setEvaluation(data.evaluation);
                // Auto-expand all questions for better UX
                const allQuestionIndices = data.evaluation.qa_feedback.map((_: any, index: number) => index);
                setExpandedQuestions(new Set(allQuestionIndices));
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

        evaluateInterview();
    }, [sessionId, user?.id, propEvaluation]);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Enhanced Interview Results</h2>
                {isLoading && (
                    <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm font-medium">Generating your evaluation...</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && !error && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating your evaluation...</h3>
                    <p className="text-gray-600">Please wait while we analyze your interview responses</p>
                </div>
            )}

            {/* Enhanced Overall Evaluation Summary */}
            {evaluation && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="text-xl font-bold mb-4 text-blue-900">Eurprep Team's Evaluation Summary</h3>

                    {/* Score Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">{evaluation.overall_feedback.averageScore.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Average Score</div>
                            {renderScoreMeter(evaluation.overall_feedback.averageScore)}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{evaluation.overall_feedback.coveragePercentage}%</div>
                            <div className="text-sm text-gray-600">Core Points Coverage</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${evaluation.overall_feedback.coveragePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-purple-600">{evaluation.overall_feedback.totalScore}</div>
                            <div className="text-sm text-gray-600">Total Score</div>
                            <div className="text-xs text-gray-500 mt-1">Out of {questions.length * 10}</div>
                        </div>
                    </div>

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

            {/* Enhanced Q&A with Detailed Feedback */}
            <div className="space-y-4">
                {questions.map((question, index) => {
                    const qaFeedback = evaluation?.qa_feedback.find(
                        qa => qa.question === question
                    );
                    const isExpanded = expandedQuestions.has(index);

                    return (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            {/* Question Header */}
                            <div
                                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleQuestionExpansion(index)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-800">
                                                Question {index + 1}
                                </h3>
                                            {qaFeedback && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(qaFeedback.score)}`}>
                                                    {qaFeedback.score}/10
                                                </span>
                                            )}
                                            {qaFeedback && (
                                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                                                    {qaFeedback.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm line-clamp-2">{question}</p>
                                    </div>
                                    <div className="ml-4">
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && qaFeedback && (
                                <div className="p-4 space-y-4">
                                    {/* Your Answer */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Your Answer:</h4>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                                    {answers[index] || 'No answer recorded'}
                                </p>
                            </div>

                                    {/* Score Meter */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-800">Score</h4>
                                            <span className="text-sm text-gray-600">{qaFeedback.score}/10</span>
                                        </div>
                                        {renderScoreMeter(qaFeedback.score)}
                                    </div>

                                    {/* Strengths */}
                                    {qaFeedback.strengths.length > 0 && (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                            <h4 className="font-semibold text-green-800 mb-2">✅ Strengths</h4>
                                            <ul className="text-green-700 space-y-1">
                                                {qaFeedback.strengths.map((strength, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="mr-2">•</span>
                                                        <span>{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Gaps */}
                                    {qaFeedback.gaps.length > 0 && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                            <h4 className="font-semibold text-red-800 mb-2">❌ Areas for Improvement</h4>
                                            <ul className="text-red-700 space-y-1">
                                                {qaFeedback.gaps.map((gap, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="mr-2">•</span>
                                                        <span>{gap}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Improvement Tips */}
                                    {qaFeedback.improvementTips.length > 0 && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                            <h4 className="font-semibold text-yellow-800 mb-2">💡 Improvement Tips</h4>
                                            <ul className="text-yellow-700 space-y-1">
                                                {qaFeedback.improvementTips.map((tip, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="mr-2">•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Core Points Coverage */}
                                    {(qaFeedback.coveredCorePoints || qaFeedback.missedCorePoints) && (
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                            <h4 className="font-semibold text-blue-800 mb-2">📋 Core Points Analysis</h4>
                                            {qaFeedback.coveredCorePoints && qaFeedback.coveredCorePoints.length > 0 && (
                                                <div className="mb-3">
                                                    <h5 className="font-medium text-green-700 mb-1">✅ Covered Points:</h5>
                                                    <ul className="text-green-600 text-sm space-y-1">
                                                        {qaFeedback.coveredCorePoints.map((point, idx) => (
                                                            <li key={idx} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {qaFeedback.missedCorePoints && qaFeedback.missedCorePoints.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium text-red-700 mb-1">❌ Missed Points:</h5>
                                                    <ul className="text-red-600 text-sm space-y-1">
                                                        {qaFeedback.missedCorePoints.map((point, idx) => (
                                                            <li key={idx} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Keywords Analysis */}
                                    {(qaFeedback.keywordsMatched || qaFeedback.keywordsMissed) && (
                                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                                            <h4 className="font-semibold text-purple-800 mb-2">🔑 Keywords Analysis</h4>
                                            {qaFeedback.keywordsMatched && qaFeedback.keywordsMatched.length > 0 && (
                                                <div className="mb-3">
                                                    <h5 className="font-medium text-green-700 mb-1">✅ Keywords Used:</h5>
                                                    <div className="flex flex-wrap gap-1">
                                                        {qaFeedback.keywordsMatched.map((keyword, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {qaFeedback.keywordsMissed && qaFeedback.keywordsMissed.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium text-red-700 mb-1">❌ Keywords to Include:</h5>
                                                    <div className="flex flex-wrap gap-1">
                                                        {qaFeedback.keywordsMissed.map((keyword, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Reflection Prompt */}
                                    {qaFeedback.reflectionPrompt && (
                                        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                                            <h4 className="font-semibold text-gray-800 mb-2">🤔 Reflection Question</h4>
                                            <p className="text-gray-700 italic">"{qaFeedback.reflectionPrompt}"</p>
                                        </div>
                                    )}

                                    {/* Context */}
                                    {qaFeedback.context && (
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                            <h4 className="font-semibold text-blue-800 mb-2">📚 Additional Context</h4>
                                            <p className="text-blue-700">{qaFeedback.context}</p>
                                        </div>
                                    )}

                                    {/* Model Answer Reference */}
                                    {qaFeedback.modelAnswerReference && (
                                        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
                                            <h4 className="font-semibold text-indigo-800 mb-2">📖 Model Answer Reference</h4>
                                            <p className="text-indigo-700 text-sm">{qaFeedback.modelAnswerReference}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default ResultsView;
