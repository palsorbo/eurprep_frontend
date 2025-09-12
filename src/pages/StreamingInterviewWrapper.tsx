import { useParams } from 'react-router-dom';
import PremiumRoute from '../components/PremiumRoute';
import StreamingInterview from './StreamingInterview';
import { INTERVIEW_SETS } from '../constants/interviewSets';

export default function StreamingInterviewWrapper() {
    const { setId } = useParams<{ setId: string }>();

    // Find the interview set by ID
    const interviewSet = INTERVIEW_SETS.find(set => set.id === parseInt(setId || '0'));

    // If set not found, treat as premium (fallback)
    if (!interviewSet) {
        return (
            <PremiumRoute>
                <StreamingInterview />
            </PremiumRoute>
        );
    }

    // If set is free, render directly
    if (interviewSet.isFree) {
        return <StreamingInterview />;
    }

    // If set requires premium, wrap with PremiumRoute
    return (
        <PremiumRoute>
            <StreamingInterview />
        </PremiumRoute>
    );
}
