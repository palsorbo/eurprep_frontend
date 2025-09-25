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
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
            <div className="relative">
                {isListening && (
                    <div className="absolute top-2 right-4 flex items-center text-blue-600">
                        <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        <span className="text-xs font-medium">Listening...</span>
                    </div>
                )}
                <pre className="whitespace-pre-wrap text-gray-900 text-sm min-h-[80px]">
                    {finalLines.join('\n')}
                    <span className="text-gray-400">{interimLine}</span>
                </pre>
            </div>
        </div>
    );
};

export default TranscriptDisplay;
