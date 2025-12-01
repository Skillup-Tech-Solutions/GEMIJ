import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const ArticleSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <Skeleton className="h-8 w-32 rounded-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>

                    <Skeleton className="h-12 w-3/4 mb-6" />

                    {/* Authors Skeleton */}
                    <div className="flex items-start space-x-2 mb-4">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </div>

                    {/* Metadata Skeleton */}
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <Skeleton className="h-8 w-32 mb-4" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <Skeleton className="h-8 w-32 mb-4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <Skeleton className="h-10 w-full mb-4" />
                            <Skeleton className="h-32 w-full mb-4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleSkeleton;
