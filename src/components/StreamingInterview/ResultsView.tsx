import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, ClipboardList, Award, TrendingUp, Target } from 'lucide-react';

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

    // Start with all questions collapsed by default
    useEffect(() => {
        // Questions start collapsed - users can expand them as needed
        setExpandedQuestions(new Set());
    }, [evaluation]);

    return (
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-6xl mx-auto">
            {/* Enhanced Header Section */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-blue-600 mr-3" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Interview Performance Report
                    </h2>
                </div>
                <p className="text-gray-600 text-lg">Detailed analysis of your interview performance</p>
            </div>

            {/* Enhanced Overall Evaluation Summary */}
            <div className="mb-10 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 shadow-lg">
                <div className="flex items-center mb-6">
                    <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-blue-900">Eurprep Team's Evaluation Summary</h3>
                </div>

                {/* Enhanced Score Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-3xl font-bold text-blue-600">{evaluation.overall_feedback.averageScore.toFixed(1)}</div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-3">Average Score</div>
                        {renderScoreMeter(evaluation.overall_feedback.averageScore)}
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-3xl font-bold text-green-600">{evaluation.overall_feedback.coveragePercentage}%</div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-3">Core Points Coverage</div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                            <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${evaluation.overall_feedback.coveragePercentage}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-3xl font-bold text-purple-600">{evaluation.overall_feedback.totalScore}</div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Total Score</div>
                        <div className="text-sm text-gray-500">Out of {questions.length * 10} points</div>
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

            {/* Professional Q&A Analysis */}
            <div className="space-y-4">
                <div className="flex items-center mb-6">
                    <div className="h-px bg-gray-300 flex-1 mr-4"></div>
                    <h3 className="text-xl font-semibold text-gray-800 px-4">
                        Detailed Question Analysis
                    </h3>
                    <div className="h-px bg-gray-300 flex-1 ml-4"></div>
                </div>
                {questions.map((question, index) => {
                    const qaFeedback = evaluation.qa_feedback.find(
                        qa => qa.question === question
                    );
                    const isExpanded = expandedQuestions.has(index);

                    return (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                            {/* Clean Question Header */}
                            <div
                                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleQuestionExpansion(index)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                {/* <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div> */}
                                                <h3 className="font-semibold text-gray-900">
                                                    Question {index + 1}
                                                </h3>
                                            </div>
                                            {qaFeedback && (
                                                <>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                        {qaFeedback.category}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(qaFeedback.score)}`}>
                                                        {qaFeedback.score}/10
                                                    </span>

                                                </>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed pr-4">{question}</p>
                                    </div>
                                    <div className="ml-4 flex items-center">
                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-500" />
                                        ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Simplified Expanded Content */}
                            {isExpanded && qaFeedback && (
                                <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                                    <div className="space-y-6 pt-6">
                                        {/* Full Width Answer */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-3">Your Answer:</h4>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {answers[index] || 'No answer recorded'}
                                                </p>
                                            </div>
                                        </div>



                                        {/* Core Points Coverage */}
                                        {(qaFeedback.corePointsCoverage.covered.length > 0 || qaFeedback.corePointsCoverage.missed.length > 0) && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                                                    <ClipboardList className="w-5 h-5 mr-2" />
                                                    Core Points Coverage
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {qaFeedback.corePointsCoverage.covered.length > 0 && (
                                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                            <h5 className="font-medium text-green-700 mb-3">✅ Points Covered:</h5>
                                                            <ul className="space-y-1">
                                                                {qaFeedback.corePointsCoverage.covered.map((point: string, idx: number) => (
                                                                    <li key={idx} className="text-green-700 text-sm">• {point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {qaFeedback.corePointsCoverage.missed.length > 0 && (
                                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                            <h5 className="font-medium text-orange-700 mb-3">🎯 Points to Include:</h5>
                                                            <ul className="space-y-1">
                                                                {qaFeedback.corePointsCoverage.missed.map((point: string, idx: number) => (
                                                                    <li key={idx} className="text-orange-700 text-sm">• {point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Key Improvements */}
                                        {qaFeedback.keyImprovements.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                                    <Lightbulb className="w-5 h-5 mr-2" />
                                                    Key Improvements
                                                </h4>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <ul className="space-y-2">
                                                        {qaFeedback.keyImprovements.map((improvement: string, idx: number) => (
                                                            <li key={idx} className="text-gray-700 text-sm">• {improvement}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Category Insight */}
                                        {qaFeedback.categoryInsight && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3">💡 Category Guidance</h4>
                                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                                    <p className="text-blue-800">{qaFeedback.categoryInsight}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
