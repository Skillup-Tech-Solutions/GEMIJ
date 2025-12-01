import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const IssueSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Skeleton className="h-12 w-3/4 mb-8" />
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IssueSkeleton;
