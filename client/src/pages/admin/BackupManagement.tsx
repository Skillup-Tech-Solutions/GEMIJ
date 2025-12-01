import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '@/services/adminService';
import { formatBytes, formatDuration } from '@/utils/format';
import Pagination from '@/components/ui/Pagination';
import BackupSkeleton from '@/components/skeletons/BackupSkeleton';

interface Backup {
    id: string;
    fileName: string;
    fileSize: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    startedAt: string;
    completedAt: string | null;
    duration: number | null;
    error: string | null;
    b2FileId?: string | null;
    initiatedBy: {
        id: string;
        name: string;
        email: string;
    };
}

const BackupManagement: React.FC = () => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [activeBackupId, setActiveBackupId] = useState<string | null>(null);

    const fetchBackups = async () => {
        try {
            const { backups: data, pagination } = await adminService.getBackupHistory({
                page,
                limit: 20,
                status: statusFilter || undefined
            });
            setBackups(data);
            setTotalPages(pagination.totalPages);

            // Check for in-progress backups
            const inProgress = data.find((b: Backup) => b.status === 'IN_PROGRESS');
            if (inProgress) {
                setActiveBackupId(inProgress.id);
            } else {
                setActiveBackupId(null);
            }
        } catch (error) {
            console.error('Failed to fetch backups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, [page, statusFilter]);

    // Poll for active backup status
    useEffect(() => {
        if (!activeBackupId) return;

        const interval = setInterval(async () => {
            try {
                const status = await adminService.getBackupStatus(activeBackupId);
                if (status.status !== 'IN_PROGRESS') {
                    // Backup completed or failed, refresh list
                    fetchBackups();
                }
            } catch (error) {
                console.error('Failed to poll backup status:', error);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [activeBackupId]);

    const handleCreateBackup = async () => {
        setCreating(true);
        try {
            const result = await adminService.performSystemBackup();
            setActiveBackupId(result.backupId);
            fetchBackups();
        } catch (error: any) {
            // Even if the request fails, check if we got a backup ID in the error response
            const backupId = error.response?.data?.backupId;
            if (backupId) {
                setActiveBackupId(backupId);
                fetchBackups();
            }
            // Show error but don't block if we have a backup ID to track
            console.error('Backup error:', error.response?.data?.error || 'Failed to create backup');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = async (backupId: string) => {
        try {
            const { downloadUrl, fileName } = await adminService.downloadBackup(backupId);
            // Trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to download backup');
        }
    };

    const handleDelete = async (backupId: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete backup "${fileName}"?`)) {
            return;
        }

        try {
            await adminService.deleteBackup(backupId);
            fetchBackups();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete backup');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
                {status === 'IN_PROGRESS' && '⏳ '}
                {status === 'COMPLETED' && '✓ '}
                {status === 'FAILED' && '✗ '}
                {status.replace('_', ' ')}
            </span>
        );
    };

    if (loading) {
        return <BackupSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Backup Management</h1>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating || !!activeBackupId}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? 'Creating...' : activeBackupId ? 'Backup in Progress...' : 'Create Backup'}
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All Statuses</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            {/* Backups Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initiated By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {backups.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    No backups found
                                </td>
                            </tr>
                        ) : (
                            backups.map((backup) => (
                                <tr key={backup.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(backup.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {backup.fileName}
                                        {backup.error && (
                                            <div className="text-xs text-red-600 mt-1">{backup.error}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatBytes(backup.fileSize)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(backup.startedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {backup.duration ? formatDuration(backup.duration) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {backup.initiatedBy.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {backup.status === 'COMPLETED' && backup.b2FileId ? (
                                            <>
                                                <button
                                                    onClick={() => handleDownload(backup.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(backup.id, backup.fileName)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : backup.status === 'COMPLETED' && !backup.b2FileId ? (
                                            <>
                                                <span className="text-gray-400 mr-4">File not found</span>
                                                <button
                                                    onClick={() => handleDelete(backup.id, backup.fileName)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : null}
                                        {backup.status === 'IN_PROGRESS' && (
                                            <span className="text-gray-400">Processing...</span>
                                        )}
                                        {backup.status === 'FAILED' && (
                                            <button
                                                onClick={() => handleDelete(backup.id, backup.fileName)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
};

export default BackupManagement;
