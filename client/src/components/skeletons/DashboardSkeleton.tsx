import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                        </div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48 mb-4" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Submissions List Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <Skeleton className="h-6 w-40" />
                </div>
                <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <Skeleton className="h-10 w-10 rounded" />
                                            <div className="flex-1">
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-48" />
                                            </div>
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Skeleton className="h-8 w-24 rounded" />
                                    <Skeleton className="h-8 w-24 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
