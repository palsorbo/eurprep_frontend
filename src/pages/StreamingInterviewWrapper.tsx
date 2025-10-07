import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PremiumRoute from '../components/PremiumRoute';
import StreamingInterview from '../components/StreamingInterview';
import InterviewReadiness from '../components/StreamingInterview/InterviewReadiness';
import { StreamingInterviewProvider, useStreamingInterview } from '../lib/streaming-interview-context';
import { SBI_PO_SETS, IBPS_PO_SETS } from '../constants/interviewSets';

// Types for better type safety
enum InterviewType {
    IBPS_PO = 'ibps-po',
    SBI_PO = 'sbi-po'
}

type InterviewConfig = {
    interviewSets: typeof IBPS_PO_SETS | typeof SBI_PO_SETS;
    productType: string;
    redirectTo: string;
    context: string;
};

// Centralized configuration for interview types
const INTERVIEW_TYPE_CONFIG: Record<InterviewType, InterviewConfig> = {
    [InterviewType.IBPS_PO]: {
        interviewSets: IBPS_PO_SETS,
        productType: 'ibps_po_premium_bundle',
        redirectTo: '/ibps-po',
        context: 'ibps-po'
    },
    [InterviewType.SBI_PO]: {
        interviewSets: SBI_PO_SETS,
        productType: 'sbi_po_premium_bundle',
        redirectTo: '/sbi-po',
        context: 'sbi-po'
    }
}

// Internal component that manages the interview flow
function InterviewFlowManager({ selectedSet, context }: { selectedSet: string; context: string }) {
    const { state, startInterview } = useStreamingInterview();

    // Show readiness page if readiness is not complete
    if (!state.isReadinessComplete) {
        return (
            <InterviewReadiness
                selectedSet={selectedSet}
                context={context}
                onStartInterview={startInterview}
            />
        );
    }

    // Show interview once readiness is complete
    return <StreamingInterview selectedSet={selectedSet} context={context} />;
}

export default function StreamingInterviewWrapper() {
    const { setId } = useParams<{ setId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse URL path more robustly
    const pathParts = location.pathname.split('/').filter(Boolean);
    const interviewType = pathParts[0] as InterviewType;

    // Generic error handler component
    const renderError = (title: string, message: string, actionText: string, actionPath: string) => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">{title}</h2>
                <p className="text-slate-600 mb-6">{message}</p>
                <button
                    onClick={() => navigate(actionPath)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {actionText}
                </button>
            </div>
        </div>
    );

    // Get configuration for this interview type
    const config = INTERVIEW_TYPE_CONFIG[interviewType];

    // Handle invalid interview type
    if (!config) {
        return renderError(
            'Invalid Interview Type',
            `Expected interview type: ${Object.values(InterviewType).join(' or ')}. Current path: ${location.pathname}`,
            'Go to Dashboard',
            '/dashboard'
        );
    }

    // Find the interview set by ID
    const interviewSet = config.interviewSets.find(set => set.id === parseInt(setId || '0'));

    // Handle invalid set ID
    if (!interviewSet) {
        return renderError(
            'Interview Set Not Found',
            `Interview set ${setId} not found or you don't have access to it.`,
            `Go Back to ${interviewType.toUpperCase()}`,
            config.redirectTo
        );
    }

    // Convert setId to Set name format expected by backend (e.g., "1" -> "Set1")
    const set = setId ? `Set${setId}` : 'Set1';

    const content = (
        <StreamingInterviewProvider apiUrl={import.meta.env.VITE_API_BASE_URL} context={config.context}>
            <InterviewFlowManager selectedSet={set} context={config.context} />
        </StreamingInterviewProvider>
    );

    // If set is free, render directly
    if (interviewSet.isFree) {
        return content;
    }

    // If set requires premium, wrap with PremiumRoute
    return (
        <PremiumRoute productType={config.productType} redirectTo={config.redirectTo}>
            {content}
        </PremiumRoute>
    );
}
