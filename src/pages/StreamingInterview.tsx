import React from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import StreamingInterview from '../components/StreamingInterview';

const StreamingInterviewPage: React.FC = () => {
    const { setId } = useParams<{ setId: string }>();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Extract context from URL path (e.g., "/sbi-po/interview/1" -> "sbi-po")
    const getContext = () => {
        const pathSegments = location.pathname.split('/');
        return pathSegments[1] || 'sbi-po'; // Default to sbi-po if not found
    };

    // Convert setId to Set name (e.g., "1" -> "Set1")
    // If no setId in params, fall back to query param for backward compatibility
    const getSetName = () => {
        if (setId) {
            return `Set${setId}`;
        }
        // Fallback for legacy URLs with query params
        return searchParams.get('set') || 'Set1';
    };

    const context = getContext();
    const set = getSetName();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {context.toUpperCase()} Interview - {set}
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <StreamingInterview selectedSet={set} selectedContext={context} />
            </div>
        </div>
    );
};

export default StreamingInterviewPage;