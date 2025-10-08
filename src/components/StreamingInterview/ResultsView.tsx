import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ClipboardList } from 'lucide-react';

// Simplified feedback structure with mentor tone
interface SimplifiedQaFeedback {
    question: string;
    answer: string;
    category: string;
    score: number; // 0-10 based primarily on core points coverage
    corePointsCoverage: {
        covered: string[];
        missed: string[]; // Focus on what's most important for improvement
    };
    keyImprovements: string[]; // Top 2-3 actionable items only
    categoryInsight?: string; // Brief, encouraging guidance
}

interface SimplifiedOverallFeedback {
    summary: string; // Concise, encouraging assessment
    recommendation: 'You are ready' | 'Almost Ready' | 'Needs More Practice';
    totalScore: number;
    averageScore: number;
    coveragePercentage: number;
}

interface SimplifiedInterviewEvaluation {
    interview_set: string;
    version: string;
    qa_feedback: SimplifiedQaFeedback[];
    overall_feedback: SimplifiedOverallFeedback;
}

interface ResultsViewProps {
    questions: string[];
    answers: string[];
    evaluation: SimplifiedInterviewEvaluation;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, answers, evaluation }) => {
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'You are ready':
                return 'text-green-600 bg-green-100';
            case 'Almost Ready':
                return 'text-blue-600 bg-blue-100';
            case 'Needs More Practice':
                return 'text-orange-600 bg-orange-100';
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

    // Auto-expand all questions on mount
    useEffect(() => {
        const allQuestionIndices = evaluation.qa_feedback.map((_: any, index: number) => index);
        setExpandedQuestions(new Set(allQuestionIndices));
    }, [evaluation]);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            {/* <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Enhanced Interview Results</h2>
            </div> */}

            {/* Enhanced Overall Evaluation Summary */}
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

            {/* Enhanced Q&A with Detailed Feedback */}
            <div className="space-y-4">
                {questions.map((question, index) => {
                    const qaFeedback = evaluation.qa_feedback.find(
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

                            {/* Simplified Expanded Content */}
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

                                    {/* Core Points Coverage */}
                                    {(qaFeedback.corePointsCoverage.covered.length > 0 || qaFeedback.corePointsCoverage.missed.length > 0) && (
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                                <ClipboardList className="w-5 h-5 mr-2" />
                                                Core Points Coverage
                                            </h4>
                                            {qaFeedback.corePointsCoverage.covered.length > 0 && (
                                                <div className="mb-3">
                                                    <h5 className="font-medium text-green-700 mb-2">✅ Points You Covered:</h5>
                                                    <ul className="text-green-700 space-y-1">
                                                        {qaFeedback.corePointsCoverage.covered.map((point: string, idx: number) => (
                                                            <li key={idx} className="flex items-start">
                                                                <span className="mr-2">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {qaFeedback.corePointsCoverage.missed.length > 0 && (
                                                <div>
                                                    <h5 className="font-medium text-orange-700 mb-2">🎯 Points to Include Next Time:</h5>
                                                    <ul className="text-orange-700 space-y-1">
                                                        {qaFeedback.corePointsCoverage.missed.map((point: string, idx: number) => (
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

                                    {/* Key Improvements */}
                                    {qaFeedback.keyImprovements.length > 0 && (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                                                <Lightbulb className="w-5 h-5 mr-2" />
                                                Key Improvements
                                            </h4>
                                            <ul className="text-green-700 space-y-1">
                                                {qaFeedback.keyImprovements.map((improvement: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="mr-2">•</span>
                                                        <span>{improvement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Category Insight */}
                                    {qaFeedback.categoryInsight && (
                                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                                            <h4 className="font-semibold text-purple-800 mb-2">💡 Category Guidance</h4>
                                            <p className="text-purple-700">{qaFeedback.categoryInsight}</p>
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
