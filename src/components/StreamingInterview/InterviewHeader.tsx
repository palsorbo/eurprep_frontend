import React from 'react';

interface InterviewHeaderProps {
    totalQuestions: number;
    questionNumber: number;
    progressPercentage: number;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
    totalQuestions,
    questionNumber,
    progressPercentage
}) => {
    return (
        <div className="text-center mb-40 relative z-10">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Interview Session</h2>
            {totalQuestions > 0 && (
                <div className="flex items-center justify-center space-x-8">
                    <p className="text-2xl text-gray-600 font-medium">
                        Question {questionNumber} of {totalQuestions}
                    </p>
                    <div className="w-48 bg-gray-200 rounded-full h-4 shadow-inner">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 shadow-lg"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InterviewHeader;
