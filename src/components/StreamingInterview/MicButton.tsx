import React from 'react';

interface MicButtonProps {
    onToggle: () => void;
    flowState: string;
    isEnabled: boolean;
    title: string;
}

const MicButton: React.FC<MicButtonProps> = ({
    onToggle,
    flowState,
    isEnabled,
    title
}) => {
    const baseClass = "relative w-32 h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110";
    const stateClass = flowState === 'IDLE'
        ? 'bg-gray-600 hover:bg-gray-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse';
    const shadowClass = flowState === 'LISTENING' ? 'shadow-2xl shadow-blue-500/60' : 'shadow-xl';
    const buttonClass = `${baseClass} ${stateClass} ${shadowClass}`;

    return (
        <button
            onClick={onToggle}
            disabled={!isEnabled}
            className={buttonClass}
            title={title}
        >
            <svg
                className="w-16 h-16 lg:w-18 lg:h-18"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
        </button>
    );
};

export default MicButton;
