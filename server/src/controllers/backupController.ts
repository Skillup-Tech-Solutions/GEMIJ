import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types';
import { backblazeService } from '../services/backblazeService';

/**
 * Get all backup history with pagination
 */
export const getBackupHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const { status } = req.query;

        const where: any = {};
        if (status && ['IN_PROGRESS', 'COMPLETED', 'FAILED'].includes(String(status))) {
            where.status = status;
        }

        const [backups, total] = await Promise.all([
            prisma.backupHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startedAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.backupHistory.count({ where })
        ]);

        const formattedBackups = backups.map(backup => ({
            id: backup.id,
            fileName: backup.fileName,
            fileSize: Number(backup.fileSize),
            status: backup.status,
            startedAt: backup.startedAt.toISOString(),
            completedAt: backup.completedAt?.toISOString() || null,
            duration: backup.completedAt
                ? Math.round((backup.completedAt.getTime() - backup.startedAt.getTime()) / 1000)
                : null,
            error: backup.error,
            b2FileId: backup.b2FileId,
            initiatedBy: {
                id: backup.user.id,
                name: `${backup.user.firstName} ${backup.user.lastName}`,
                email: backup.user.email
            }
        }));

        return res.json({
            success: true,
            data: formattedBackups,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get backup history error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Get backup details by ID
 */
export const getBackupDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const backup = await prisma.backupHistory.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                error: 'Backup not found'
            });
        }

        return res.json({
            success: true,
            data: {
                id: backup.id,
                fileName: backup.fileName,
                fileSize: Number(backup.fileSize),
                status: backup.status,
                startedAt: backup.startedAt.toISOString(),
                completedAt: backup.completedAt?.toISOString() || null,
                duration: backup.completedAt
                    ? Math.round((backup.completedAt.getTime() - backup.startedAt.getTime()) / 1000)
                    : null,
                error: backup.error,
                uploadUrl: backup.uploadUrl,
                b2FileId: backup.b2FileId,
                initiatedBy: {
                    id: backup.user.id,
                    name: `${backup.user.firstName} ${backup.user.lastName}`,
                    email: backup.user.email
                }
            }
        });
    } catch (error) {
        console.error('Get backup details error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Get backup status (for real-time polling)
 */
export const getBackupStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const backup = await prisma.backupHistory.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                fileName: true,
                fileSize: true,
                startedAt: true,
                completedAt: true,
                error: true
            }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                error: 'Backup not found'
            });
        }

        return res.json({
            success: true,
            data: {
                id: backup.id,
                status: backup.status,
                fileName: backup.fileName,
                fileSize: Number(backup.fileSize),
                startedAt: backup.startedAt.toISOString(),
                completedAt: backup.completedAt?.toISOString() || null,
                error: backup.error
            }
        });
    } catch (error) {
        console.error('Get backup status error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Download backup file
 */
export const downloadBackup = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const backup = await prisma.backupHistory.findUnique({
            where: { id },
            select: {
                id: true,
                fileName: true,
                status: true,
                uploadUrl: true,
                b2FileId: true
            }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                error: 'Backup not found'
            });
        }

        if (backup.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                error: 'Backup is not completed yet'
            });
        }

        if (!backup.b2FileId) {
            return res.status(404).json({
                success: false,
                error: 'Backup file not found in storage'
            });
        }

        // Determine the correct filename
        // 1. Try to extract from uploadUrl if available (most accurate as it contains the unique B2 name)
        // 2. Fallback to stored fileName
        let fileName = backup.fileName;

        if (backup.uploadUrl) {
            try {
                // uploadUrl format: .../file/<bucketName>/<fileName>
                // We want the part after the bucket name
                const parts = backup.uploadUrl.split('/');
                const bucketIndex = parts.indexOf('file') + 1; // bucket name is after 'file'
                if (bucketIndex > 0 && bucketIndex + 1 < parts.length) {
                    // Reconstruct the path after the bucket name
                    // This handles cases where filename might contain slashes (e.g. backups/foo.gz)
                    fileName = parts.slice(bucketIndex + 1).join('/');
                }
            } catch (e) {
                console.warn('Failed to extract filename from uploadUrl, using stored fileName');
            }
        }

        // Generate signed download URL (valid for 1 hour)
        const signedUrl = await backblazeService.getAuthorizedDownloadUrl(
            fileName,
            3600
        );

        return res.json({
            success: true,
            data: {
                downloadUrl: signedUrl,
                fileName: fileName.replace('backups/', ''), // Clean name for user download
                expiresIn: 3600 // seconds
            }
        });
    } catch (error) {
        console.error('Download backup error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate download URL'
        });
    }
};

/**
 * Delete backup
 */
export const deleteBackup = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const backup = await prisma.backupHistory.findUnique({
            where: { id },
            select: {
                id: true,
                fileName: true,
                b2FileId: true
            }
        });

        if (!backup) {
            return res.status(404).json({
                success: false,
                error: 'Backup not found'
            });
        }

        // Delete from B2 if file exists
        if (backup.b2FileId && backup.fileName) {
            try {
                const fileName = backup.fileName.replace('backups/', '');
                await backblazeService.deleteFile(`backups/${fileName}`, backup.b2FileId);
            } catch (error) {
                console.error('Failed to delete backup from B2:', error);
                // Continue with database deletion even if B2 deletion fails
            }
        }

        // Delete from database
        await prisma.backupHistory.delete({
            where: { id }
        });

        return res.json({
            success: true,
            message: 'Backup deleted successfully'
        });
    } catch (error) {
        console.error('Delete backup error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete backup'
        });
    }
};
