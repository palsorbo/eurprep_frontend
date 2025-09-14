import { useNavigate, useParams } from 'react-router-dom';
import PremiumRoute from '../components/PremiumRoute';
import StreamingInterview from '../components/StreamingInterview';
import { StreamingInterviewProvider } from '../lib/streaming-interview-context';
import { INTERVIEW_SETS } from '../constants/interviewSets';

export default function StreamingInterviewWrapper() {
    const { setId } = useParams<{ setId: string }>();
    const navigate = useNavigate(); 

    // Find the interview set by ID
    const interviewSet = INTERVIEW_SETS.find(set => set.id === parseInt(setId || '0'));

    // If set not found, show error
    if (!interviewSet) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>Interview set not found or you don't have access to it</div>
                <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
        );
    }

    // Convert setId to Set name (e.g., "1" -> "Set1")
    const set = setId ? `Set${setId}` : 'Set1';
    const context = 'sbi-po'; // Hardcoded for now
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const content = (
        <StreamingInterviewProvider apiUrl={apiUrl}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <StreamingInterview selectedSet={set} selectedContext={context} />
            </div>
        </StreamingInterviewProvider>
    );

    // If set is free, render directly
    if (interviewSet.isFree) {
        return content;
    }

    // If set requires premium, wrap with PremiumRoute
    return (
        <PremiumRoute>
            {content}
        </PremiumRoute>
    );
}
