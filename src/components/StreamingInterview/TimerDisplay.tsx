import React from 'react';

interface TimerDisplayProps {
    sessionId: string | null;
    elapsedTime: number;
    formatTime: (time: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
    sessionId,
    elapsedTime,
    formatTime
}) => {
    if (!sessionId) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xl font-bold text-blue-800 font-mono">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TimerDisplay;
