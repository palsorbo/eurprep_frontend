import { useParams } from 'react-router-dom';
import PremiumRoute from '../components/PremiumRoute';
import StreamingInterview from './StreamingInterview';

export default function StreamingInterviewWrapper() {
    const { setId } = useParams<{ setId: string }>();

    // Set 1 is free, Sets 2 and 3 require premium
    if (setId === "1") {
        return <StreamingInterview />;
    }

    return (
        <PremiumRoute>
            <StreamingInterview />
        </PremiumRoute>
    );
}
