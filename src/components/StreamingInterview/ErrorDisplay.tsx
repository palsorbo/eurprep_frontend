import React from 'react';

interface ErrorDisplayProps {
    error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    if (!error) return null;

    return (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8 shadow-lg">
            <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{error}</span>
            </div>
        </div>
    );
};

export default ErrorDisplay;
