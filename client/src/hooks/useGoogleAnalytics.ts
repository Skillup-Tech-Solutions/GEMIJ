import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../utils/analytics';

// Custom hook to initialize and track page views with Google Analytics
export const useGoogleAnalytics = (): void => {
    const location = useLocation();

    useEffect(() => {
        // Initialize GA on mount
        initGA();
    }, []);

    useEffect(() => {
        // Track page view on route change
        trackPageView(location.pathname + location.search);
    }, [location]);
};
