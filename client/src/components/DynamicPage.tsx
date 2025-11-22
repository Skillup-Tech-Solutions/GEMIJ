import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DynamicPageProps {
    slug: string;
    title: string;
    defaultContent?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug, title, defaultContent }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`/api/public/page-content/${slug}`);

                if (response.data.success) {
                    setContent(response.data.data.content);
                } else {
                    throw new Error('Failed to load page content');
                }
            } catch (err) {
                console.error('Error fetching page content:', err);
                setError('Failed to load page content');

                // Use default content if provided
                if (defaultContent) {
                    setContent(defaultContent);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [slug, defaultContent]);

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

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900 mb-4">{title}</h1>
            </div>
            <div
                className="dynamic-content"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default DynamicPage;
