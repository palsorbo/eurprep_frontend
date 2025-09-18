import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../lib/payment-context';
import LoadingScreen from './LoadingScreen';

interface PremiumRouteProps {
    children: React.ReactNode;
    productType: string;
    redirectTo: string;
}

export default function PremiumRoute({ children, productType, redirectTo }: PremiumRouteProps) {
    const { hasAccessToProduct, isLoading } = usePayment();
    const navigate = useNavigate();
    const [shouldRender, setShouldRender] = useState(false);

    const hasAccess = hasAccessToProduct(productType);

    useEffect(() => {
        if (!isLoading && !hasAccess) {
            navigate(redirectTo, { replace: true });
        } else if (!isLoading && hasAccess) {
            setShouldRender(true);
        }
    }, [hasAccess, isLoading, navigate, redirectTo]);

    if (isLoading) {
        return <LoadingScreen message="Checking access..." />;
    }

    return shouldRender ? <>{children}</> : null;
}
