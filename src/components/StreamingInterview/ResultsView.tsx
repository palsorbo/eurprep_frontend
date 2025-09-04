import React from 'react';

interface ResultsViewProps {
    questions: string[];
    answers: string[];
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, answers }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Interview Results</h2>
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div key={index} className="border-b pb-4">
                        <h3 className="font-semibold text-gray-800">Question {index + 1}:</h3>
                        <p className="text-gray-700 mb-2">{question}</p>
                        <h3 className="font-semibold text-gray-800">Answer:</h3>
                        <p className="text-gray-700">{answers[index] || 'No answer recorded'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultsView;
