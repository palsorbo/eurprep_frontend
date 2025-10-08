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
        <div className="absolute top-6 right-6 z-50">
            <div className="bg-white/80 border border-blue-200/60 rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg font-bold text-blue-800 font-mono">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TimerDisplay;
