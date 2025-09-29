import React, { useState } from 'react';

interface MicButtonProps {
    isEnabled: boolean;
    title: string;
    onStart?: () => void;
    onStop?: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({
    isEnabled,
    title,
    onStart,
    onStop
}) => {
    const [isRecording, setIsRecording] = useState(false);

    const handleClick = () => {
        if (!isEnabled) return;
        if (isRecording) {
            setIsRecording(false);
            onStop?.();
        } else {
            setIsRecording(true);
            onStart?.();
        }
    };

    const baseClass = "relative w-32 h-40 lg:w-36 lg:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed";
    const stateClass = isRecording
        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
        : 'bg-gray-600 hover:bg-gray-700 text-white';
    const shadowClass = isRecording ? 'shadow-2xl shadow-red-500/60' : 'shadow-xl';
    const buttonClass = `${baseClass} ${stateClass} ${shadowClass}`;

    return (
        <button
            onClick={handleClick}
            disabled={!isEnabled}
            className={buttonClass}
            title={title}
            aria-label={title}
        >
            <div className="flex flex-col items-center">
                {isRecording && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                )}
                <svg
                    className="w-16 h-16 lg:w-18 lg:h-18 mb-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                <span className="text-base font-semibold">
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </span>
            </div>
        </button>
    );
};

export default MicButton;
