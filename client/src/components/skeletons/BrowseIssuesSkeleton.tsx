import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const BrowseIssuesSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrowseIssuesSkeleton;
