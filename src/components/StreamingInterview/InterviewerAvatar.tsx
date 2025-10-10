import React, { useState } from 'react';

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
    const [isHovered, setIsHovered] = useState(false);
    // SVG icons for male and female silhouettes
    const MaleIcon = () => (
        <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
        >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    );

    const FemaleIcon = () => (
        <svg
            width="56"
            height="56"
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
            {/* Speech Bubble - shows on hover when speaking */}
            {isSpeaking && questionText && (
                <div
                    className={`
                        absolute bottom-full mb-4 px-4 py-3
                        bg-white/95 border border-blue-200/70
                        rounded-xl shadow-lg backdrop-blur-sm
                        max-w-sm sm:max-w-md min-w-72 max-h-48 overflow-y-auto z-20
                        transition-all duration-300 ease-out
                        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                    `}
                >
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-200/70"></div>

                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {questionText}
                    </p>
                </div>
            )}

            {/* Avatar Container */}
            <div
                className={`
                    relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-full flex items-center justify-center
                    transition-all duration-300 ease-out
                    ${isActive
                        ? 'scale-105 shadow-xl shadow-blue-500/40 ring-2 ring-blue-400/60'
                        : 'scale-100 shadow-lg hover:shadow-xl hover:scale-102'
                    }
                    ${isSpeaking
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300 cursor-pointer'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300 hover:from-blue-50 hover:to-blue-100'
                    }
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Subtle glow effect for active interviewer */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-400/15"></div>
                )}

                {/* Avatar Icon */}
                <div className="relative z-10">
                    {gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                </div>

                {/* Subtle speaking indicator */}
                {isSpeaking && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
            </div>

            {/* Interviewer Name */}
            <div className="mt-5 text-lg font-bold text-gray-800">
                {name}
            </div>

        </div>
    );
};

export default InterviewerAvatar;
