import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const BackupSkeleton: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="mb-4">
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-7 gap-4">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full" />
                        ))}
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-7 gap-4 items-center">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BackupSkeleton;
