import React from 'react';

interface StartInterviewButtonProps {
    selectedSet: string | undefined;
    startInterview: (set: string | undefined, type: string) => void;
    isConnected: boolean;
}

const StartInterviewButton: React.FC<StartInterviewButtonProps> = ({
    selectedSet,
    startInterview,
    isConnected
}) => {
    return (
        <div className="flex-1 flex items-center justify-center py-20">
            <button
                onClick={() => startInterview(selectedSet, 'sbi-po')}
                disabled={!isConnected}
                className="bg-blue-600 text-white px-16 py-8 rounded-2xl text-2xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
                Start Interview
            </button>
        </div>
    );
};

export default StartInterviewButton;
