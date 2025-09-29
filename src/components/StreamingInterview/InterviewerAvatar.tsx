import React from 'react';

interface InterviewerAvatarProps {
    id: number;
    name: string;
    gender: 'male' | 'female';
    isActive: boolean;
    isSpeaking: boolean;
    questionText?: string;
}

const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
    name,
    gender,
    isActive,
    isSpeaking,
    questionText
}) => {
    // SVG icons for male and female silhouettes
    const MaleIcon = () => (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
        >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    );

    const FemaleIcon = () => (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
        >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            <circle cx="12" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );

    return (
        <div className="relative flex flex-col items-center">
            {/* Speech Bubble */}
            {isSpeaking && questionText && (
                <div
                    className={`
                        absolute bottom-full mb-4 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-2xl
                        max-w-md min-w-80 max-h-48 overflow-y-auto z-10
                        transition-all duration-300 ease-out
                        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                    `}
                >
                    {/* Speech bubble arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 shadow-2xl drop-shadow-2xl">
                        <div className="w-0 h-0 border-l-24 border-r-24 border-t-24 border-l-transparent border-r-transparent border-t-white"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1.5">
                            <div className="w-0 h-0 border-l-24 border-r-24 border-t-24 border-l-transparent border-r-transparent border-t-gray-500 shadow-md"></div>
                        </div>
                    </div>

                    {/* Question text */}
                    <p className="text-sm text-gray-800 leading-relaxed font-medium line-clamp-6">
                        {questionText}
                    </p>
                </div>
            )}

            {/* Avatar Container */}
            <div
                className={`
                    relative w-28 h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${isActive
                        ? 'scale-110 shadow-2xl shadow-blue-500/50 ring-4 ring-blue-400'
                        : 'scale-100 shadow-xl'
                    }
                    ${isSpeaking
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }
                `}
            >
                {/* Glow effect for active interviewer */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-pulse"></div>
                )}

                {/* Avatar Icon */}
                <div className="relative z-10">
                    {gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                </div>
            </div>

            {/* Interviewer Name */}
            <div className="mt-5 text-lg font-bold text-gray-800">
                {name}
            </div>

        </div>
    );
};

export default InterviewerAvatar;
