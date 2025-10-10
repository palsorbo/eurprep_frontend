import React from 'react';

interface TranscriptDisplayProps {
    finalLines: string[];
    interimLine: string;
    isListening: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
    finalLines,
    interimLine,
    isListening
}) => {
    return (
        <div className="relative">
            {/* Enhanced Listening Indicator */}
            {isListening && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg border-2 border-white flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Listening...</span>
                    </div>
                </div>
            )}

            {/* Main Transcript Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200/40 shadow-lg p-6 transition-all duration-300">
                <div className="relative min-h-[100px]">
                    {/* Final transcript lines */}
                    {finalLines.length > 0 && (
                        <div className="mb-3">
                            {finalLines.map((line, index) => (
                                <div
                                    key={index}
                                    className="text-gray-900 text-base leading-loose mb-2 last:mb-0 animate-fade-in"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Interim text with subtle styling */}
                    {interimLine && (
                        <div className="text-gray-700 text-sm leading-loose italic opacity-90 border-l-2 border-blue-300 pl-3">
                            {interimLine}
                            <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>
                        </div>
                    )}

                    {/* Empty state */}
                    {!interimLine && finalLines.length === 0 && (
                        <div className="text-gray-500 text-sm leading-loose italic text-center py-8">
                            Your speech will appear here...
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 rounded-xl -z-10"></div>
        </div>
    );
};

export default TranscriptDisplay;
