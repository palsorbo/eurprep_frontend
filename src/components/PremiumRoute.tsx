import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../lib/payment-context';
import LoadingScreen from './LoadingScreen';

interface PremiumRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export default function PremiumRoute({ children, redirectTo = '/sbi-po' }: PremiumRouteProps) {
    const { hasPaidAccess, isLoading } = usePayment();
    const navigate = useNavigate();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (!isLoading && !hasPaidAccess) {
            navigate(redirectTo, { replace: true });
        } else if (!isLoading && hasPaidAccess) {
            setShouldRender(true);
        }
    }, [hasPaidAccess, isLoading, navigate, redirectTo]);

    if (isLoading) {
        return <LoadingScreen message="Checking access..." />;
    }

    return shouldRender ? <>{children}</> : null;
}
