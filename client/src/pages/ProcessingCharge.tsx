import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProcessingCharge: React.FC = () => {
    const [content, setContent] = useState<string>('');
    const [apcFee, setApcFee] = useState<number>(0);
    const [currency, setCurrency] = useState<string>('INR');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch both page content and public settings
                const [contentResponse, settingsResponse] = await Promise.all([
                    axios.get(`${API_URL}/public/page-content/processing_charge`),
                    axios.get(`${API_URL}/public/settings`)
                ]);

                if (contentResponse.data.success) {
                    setContent(contentResponse.data.data.content);
                }

                if (settingsResponse.data.success) {
                    const settings = settingsResponse.data.data;
                    setApcFee(settings.apcFee || 0);
                    setCurrency(settings.currency || 'INR');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load page content');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatAmount = (amount: number) => {
        const currencySymbols: Record<string, string> = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        };

        const symbol = currencySymbols[currency] || currency;
        return `${symbol}${amount.toLocaleString('en-IN')}`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-secondary-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-secondary-200 rounded"></div>
                        <div className="h-4 bg-secondary-200 rounded w-5/6"></div>
                        <div className="h-4 bg-secondary-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !content) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card bg-red-50 border-2 border-red-200">
                    <div className="card-body">
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Content</h2>
                        <p className="text-red-700">{error}</p>
                        <p className="text-red-600 text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Parse the content and replace the hardcoded fee with the dynamic one
    const updatedContent = content.replace(
        /<p class="text-4xl font-bold text-primary-600 mb-2">₹20,000<\/p>/,
        `<p class="text-4xl font-bold text-primary-600 mb-2">${formatAmount(apcFee)}</p>`
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900 mb-4">Article Processing Charge</h1>
            </div>
            <div
                className="dynamic-content"
                dangerouslySetInnerHTML={{ __html: updatedContent }}
            />
        </div>
    );
};

export default ProcessingCharge;
