import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { backblazeService } from './backblazeService';
import { prisma } from '../lib/prisma';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

const execAsync = promisify(exec);

interface BackupResult {
    success: boolean;
    fileName?: string;
    fileSize?: number;
    uploadUrl?: string;
    error?: string;
}

interface BackupFile {
    fileName: string;
    uploadDate: Date;
    fileId: string;
}

class BackupService {
    private readonly BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
    private readonly BACKUP_ENABLED = process.env.BACKUP_ENABLED !== 'false';
    private readonly TEMP_DIR = '/tmp';

    /**
     * Parse DATABASE_URL to extract connection parameters
     */
    private parseDatabaseUrl(url: string): {
        host: string;
        port: string;
        database: string;
        user: string;
        password: string;
    } {
        try {
            // Use URL class for proper parsing
            const dbUrl = new URL(url);

            if (dbUrl.protocol !== 'postgresql:' && dbUrl.protocol !== 'postgres:') {
                throw new Error('URL must use postgresql:// or postgres:// protocol');
            }

            return {
                user: decodeURIComponent(dbUrl.username),
                password: decodeURIComponent(dbUrl.password),
                host: dbUrl.hostname,
                port: dbUrl.port || '5432',
                database: dbUrl.pathname.slice(1) // Remove leading slash
            };
        } catch (error: any) {
            throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
        }
    }

    /**
     * Create a database backup using pg_dump
     */
    async createBackup(userId: string): Promise<BackupResult & { backupId?: string }> {
        if (!this.BACKUP_ENABLED) {
            return {
                success: false,
                error: 'Backup functionality is disabled'
            };
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupFileName = `backup-${timestamp}.sql`;
        const gzipFileName = `${backupFileName}.gz`;
        const backupPath = path.join(this.TEMP_DIR, backupFileName);
        const gzipPath = path.join(this.TEMP_DIR, gzipFileName);

        // Create backup history record FIRST so it's visible immediately
        const backupRecord = await prisma.backupHistory.create({
            data: {
                fileName: gzipFileName,
                fileSize: BigInt(0), // Will update after compression
                status: 'IN_PROGRESS',
                initiatedBy: userId
            }
        });

        try {
            console.log(`[Backup Service] Starting database backup... (ID: ${backupRecord.id})`);

            // Get database connection details
            const databaseUrl = process.env.DATABASE_URL;
            if (!databaseUrl) {
                throw new Error('DATABASE_URL environment variable is not set');
            }

            const dbConfig = this.parseDatabaseUrl(databaseUrl);

            // Create pg_dump command with connection parameters
            const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupPath}"`;

            console.log('[Backup Service] Executing pg_dump...');
            await execAsync(pgDumpCommand, {
                maxBuffer: 1024 * 1024 * 100 // 100MB buffer
            });

            // Check if backup file was created
            const stats = await fs.stat(backupPath);
            console.log(`[Backup Service] Backup created: ${backupPath} (${stats.size} bytes)`);

            // Compress the backup using gzip
            console.log('[Backup Service] Compressing backup...');
            await pipeline(
                createReadStream(backupPath),
                zlib.createGzip({ level: 9 }), // Maximum compression
                createWriteStream(gzipPath)
            );

            const gzipStats = await fs.stat(gzipPath);
            console.log(`[Backup Service] Compressed backup: ${gzipPath} (${gzipStats.size} bytes)`);

            // Upload to Backblaze B2
            console.log('[Backup Service] Uploading to Backblaze B2...');
            const fileBuffer = await fs.readFile(gzipPath);
            const uploadResult = await backblazeService.uploadFile(
                fileBuffer,
                `backups/${gzipFileName}`,
                'application/gzip'
            );

            console.log(`[Backup Service] Upload successful: ${uploadResult.fileName}`);

            // Update backup record as completed
            await prisma.backupHistory.update({
                where: { id: backupRecord.id },
                data: {
                    status: 'COMPLETED',
                    fileName: uploadResult.fileName, // Store the actual unique filename from B2
                    fileSize: BigInt(gzipStats.size),
                    completedAt: new Date(),
                    uploadUrl: uploadResult.url,
                    b2FileId: uploadResult.fileId
                }
            });

            // Update last backup timestamp in system settings
            await prisma.systemSettings.upsert({
                where: { key: 'last_backup_at' },
                update: {
                    value: new Date().toISOString(),
                    type: 'string'
                },
                create: {
                    key: 'last_backup_at',
                    value: new Date().toISOString(),
                    type: 'string'
                }
            });

            // Clean up temporary files
            console.log('[Backup Service] Cleaning up temporary files...');
            await Promise.all([
                fs.unlink(backupPath).catch(() => { }),
                fs.unlink(gzipPath).catch(() => { })
            ]);

            // Clean up old backups
            console.log('[Backup Service] Cleaning up old backups...');
            await this.cleanupOldBackups();

            console.log('[Backup Service] Backup completed successfully');

            return {
                success: true,
                fileName: uploadResult.fileName,
                fileSize: gzipStats.size,
                uploadUrl: uploadResult.url,
                backupId: backupRecord.id
            };

        } catch (error: any) {
            console.error('[Backup Service] Backup failed:', error);

            // Update backup record as failed
            await prisma.backupHistory.update({
                where: { id: backupRecord.id },
                data: {
                    status: 'FAILED',
                    error: error.message || 'Unknown error occurred during backup',
                    completedAt: new Date()
                }
            }).catch((err: any) => console.error('Failed to update backup record:', err));

            // Clean up temporary files on error
            await Promise.all([
                fs.unlink(backupPath).catch(() => { }),
                fs.unlink(gzipPath).catch(() => { })
            ]);

            return {
                success: false,
                error: error.message || 'Unknown error occurred during backup',
                backupId: backupRecord.id
            };
        }
    }

    /**
     * Clean up backups older than retention period
     */
    async cleanupOldBackups(): Promise<void> {
        try {
            // Note: B2 doesn't have a native "list files" API in the backblaze-b2 library
            // This is a placeholder for the cleanup logic
            // In production, you would:
            // 1. List all files in the backups/ folder
            // 2. Parse the timestamp from each filename
            // 3. Delete files older than BACKUP_RETENTION_DAYS

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.BACKUP_RETENTION_DAYS);

            console.log(`[Backup Service] Cleanup: Would delete backups older than ${cutoffDate.toISOString()}`);

            // TODO: Implement actual cleanup when B2 list files API is available
            // const files = await backblazeService.listFiles('backups/');
            // for (const file of files) {
            //   const fileDate = this.extractDateFromFileName(file.fileName);
            //   if (fileDate < cutoffDate) {
            //     await backblazeService.deleteFile(file.fileName, file.fileId);
            //   }
            // }

        } catch (error) {
            console.error('[Backup Service] Cleanup failed:', error);
            // Don't throw - cleanup failure shouldn't fail the backup
        }
    }

    /**
     * Extract date from backup filename
     */
    private extractDateFromFileName(fileName: string): Date {
        // Format: backup-YYYY-MM-DDTHH-mm-ss.sql.gz
        const match = fileName.match(/backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        if (!match) {
            return new Date(0); // Return epoch if can't parse
        }

        const dateStr = match[1].replace(/-/g, ':').replace('T', 'T').slice(0, -3);
        return new Date(dateStr);
    }

    /**
     * Check if pg_dump is available
     */
    async checkPgDumpAvailable(): Promise<boolean> {
        try {
            await execAsync('which pg_dump');
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const backupService = new BackupService();
