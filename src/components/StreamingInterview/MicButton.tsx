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

    const baseClass = "relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2";
    const stateClass = isRecording
        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white border-red-400 shadow-2xl shadow-red-500/40'
        : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white border-blue-400 shadow-2xl shadow-blue-500/40';
    const buttonClass = `${baseClass} ${stateClass}`;

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
                    <>
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-sm"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-pulse opacity-30"></div>
                    </>
                )}
                <svg
                    className="w-14 h-14 mb-1 drop-shadow-sm"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="0.5"
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
                {/* <span className="text-base font-semibold">
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </span> */}
            </div>
        </button>
    );
};

export default MicButton;
