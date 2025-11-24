import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(100, filter === 'unread');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            await loadNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        setProcessing(true);
        try {
            await notificationService.markAllAsRead();
            await loadNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteNotification = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            await loadNotifications();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        if (notification.submissionId) {
            if (user?.role === 'EDITOR' || user?.role === 'ADMIN') {
                navigate(`/editor/submission/${notification.submissionId}/screen`);
            } else if (user?.role === 'REVIEWER') {
                navigate('/dashboard');
            } else {
                navigate(`/submission/${notification.submissionId}`);
            }
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'SUBMITTED':
            case 'PUBLISHED':
                return (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'UNDER_REVIEW':
            case 'REVISION_REQUIRED':
                return (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            case 'PAYMENT_PENDING':
            case 'PAYMENT_FAILED':
                return (
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <div className="bg-white border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 -ml-2"
                        size="sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                                Notifications
                            </h1>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Stay updated with all your submission activities and important updates
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleMarkAllAsRead}
                                    disabled={processing}
                                    size="sm"
                                >
                                    {processing ? 'Marking...' : 'Mark all as read'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-border mb-6">
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${filter === 'all'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-secondary-600 hover:text-secondary-900'
                                }`}
                        >
                            All Notifications
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${filter === 'unread'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-secondary-600 hover:text-secondary-900'
                                }`}
                        >
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow-sm border border-border">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-secondary-600 mt-4">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary-100 flex items-center justify-center">
                                <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </h3>
                            <p className="text-secondary-600">
                                {filter === 'unread'
                                    ? "You're all caught up! Check back later for new updates."
                                    : "We'll notify you when something happens with your submissions."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-secondary-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {getNotificationIcon(notification.type)}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                                                <h3
                                                    className={`font-semibold text-lg ${!notification.isRead ? 'text-secondary-900' : 'text-secondary-700'
                                                        }`}
                                                >
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1 hidden sm:block"></span>
                                                )}
                                            </div>

                                            <p className="text-secondary-700 mb-3 leading-relaxed">
                                                {notification.message}
                                            </p>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <p className="text-sm text-secondary-500">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {notification.submissionId && (
                                                        <button
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium px-2 py-1 hover:bg-primary-50 rounded"
                                                        >
                                                            View Submission
                                                        </button>
                                                    )}
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                        className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
