// Google Analytics utility functions
declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export const GA_TRACKING_ID = 'G-0E9E68VBSL';

// Initialize Google Analytics
export const initGA = (): void => {
    if (typeof window === 'undefined') return;

    // Create script element for gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
    });
};

// Track page views
export const trackPageView = (url: string): void => {
    if (typeof window.gtag === 'undefined') return;

    window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
};

// Track custom events
export const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
): void => {
    if (typeof window.gtag === 'undefined') return;

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};
