import React from 'react';
import { SubmissionStatus } from '@/types';

interface SubmissionProgressProps {
    status: SubmissionStatus;
}

const SubmissionProgress: React.FC<SubmissionProgressProps> = ({ status }) => {
    const steps = [
        {
            id: 'submitted',
            label: 'Submitted',
            description: 'Manuscript received',
            activeStatuses: ['SUBMITTED', 'INITIAL_REVIEW', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PAYMENT_PENDING', 'PUBLISHED', 'REJECTED', 'RETURNED_FOR_FORMATTING']
        },
        {
            id: 'screening',
            label: 'Screening',
            description: 'Initial check by editor',
            activeStatuses: ['INITIAL_REVIEW', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PAYMENT_PENDING', 'PUBLISHED', 'REJECTED', 'RETURNED_FOR_FORMATTING']
        },
        {
            id: 'review',
            label: 'Peer Review',
            description: 'Expert evaluation',
            activeStatuses: ['UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PAYMENT_PENDING', 'PUBLISHED', 'REJECTED']
        },
        {
            id: 'decision',
            label: 'Decision',
            description: 'Editorial decision made',
            activeStatuses: ['REVISION_REQUIRED', 'ACCEPTED', 'PAYMENT_PENDING', 'PUBLISHED', 'REJECTED']
        },
        {
            id: 'publication',
            label: 'Publication',
            description: 'Published online',
            activeStatuses: ['PUBLISHED']
        }
    ];

    const getCurrentStepIndex = () => {
        if (status === 'RETURNED_FOR_FORMATTING') return 1; // Stay at screening but show issue
        if (status === 'REJECTED') return 3; // Stop at decision

        // Find the furthest step that includes the current status
        for (let i = steps.length - 1; i >= 0; i--) {
            if (steps[i].activeStatuses.includes(status)) {
                return i;
            }
        }
        return 0;
    };

    const currentStepIndex = getCurrentStepIndex();
    const isRejected = status === 'REJECTED';
    const isReturned = status === 'RETURNED_FOR_FORMATTING';

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                <div
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 transition-all duration-500 -z-10 ${isRejected ? 'bg-red-500' : 'bg-primary-600'}`}
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    let circleColor = 'bg-white border-gray-300 text-gray-500';
                    if (isCompleted) {
                        if (isRejected && index === currentStepIndex) {
                            circleColor = 'bg-red-600 border-red-600 text-white';
                        } else if (isReturned && index === currentStepIndex) {
                            circleColor = 'bg-yellow-500 border-yellow-500 text-white';
                        } else {
                            circleColor = 'bg-primary-600 border-primary-600 text-white';
                        }
                    }

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-transparent">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${circleColor} z-10`}>
                                {isCompleted ? (
                                    isRejected && index === currentStepIndex ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : isReturned && index === currentStepIndex ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <div className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </div>
                                <div className="hidden md:block text-xs text-muted-foreground mt-1 max-w-[100px]">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubmissionProgress;
