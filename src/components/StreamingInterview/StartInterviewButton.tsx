import React from 'react';

interface StartInterviewButtonProps {
    selectedSet: string | undefined;
    startInterview: (set: string | undefined, context: string) => void;
    isConnected: boolean;
    context: string;
}

const StartInterviewButton: React.FC<StartInterviewButtonProps> = ({
    selectedSet,
    startInterview,
    isConnected,
    context
}) => {
    // Ensure we have valid values before starting interview
    const handleStartInterview = () => {
        if (selectedSet && context) {
            startInterview(selectedSet, context);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center py-20">
            <button
                onClick={handleStartInterview}
                disabled={!isConnected || !selectedSet}
                className="bg-blue-600 text-white px-16 py-8 rounded-2xl text-2xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
                Start Interview
            </button>
        </div>
    );
};

export default StartInterviewButton;
