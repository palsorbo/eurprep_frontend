import React from 'react';
import StreamingInterview from '../components/StreamingInterview';

const StreamingInterviewPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold text-slate-900">Streaming Interview</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <StreamingInterview />
            </div>
        </div>
    );
};

export default StreamingInterviewPage;