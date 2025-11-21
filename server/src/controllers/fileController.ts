import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import path from 'path';
import { backblazeService } from '../services/backblazeService';

const prisma = new PrismaClient();

export const uploadFiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: submissionId } = req.params;
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Extract files from either 'file' or 'files' field
    let files: Express.Multer.File[] = [];
    if (uploadedFiles.file) {
      files = files.concat(uploadedFiles.file);
    }
    if (uploadedFiles.files) {
      files = files.concat(uploadedFiles.files);
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    if (submission.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Upload files to Backblaze B2 and create database records
    const fileRecords = await Promise.all(
      files.map(async (file, index) => {
        // Upload to B2
        const b2Result = await backblazeService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        // Create database record with B2 file info
        return prisma.submissionFile.create({
          data: {
            filename: b2Result.fileName,
            originalName: file.originalname,
            fileType: path.extname(file.originalname).toLowerCase(),
            fileSize: file.size,
            filePath: b2Result.url, // Store B2 URL
            b2FileId: b2Result.fileId,
            submissionId,
            isMainFile: index === 0
          }
        });
      })
    );

    return res.status(201).json({
      success: true,
      data: fileRecords,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    console.error('Upload files error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: true
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    if (file.submission.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (!['DRAFT', 'REVISION_REQUIRED'].includes(file.submission.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete files in current submission status'
      });
    }

    // Delete from Backblaze B2
    try {
      if (file.b2FileId) {
        await backblazeService.deleteFile(file.filename, file.b2FileId);
      } else {
        console.warn('No B2 File ID found for file:', file.filename);
        // Fallback: try to delete by filename if possible or just log warning
        // Since we can't delete without ID easily, we might skip B2 deletion for legacy files
      }
    } catch (b2Error) {
      console.warn('Could not delete file from B2:', b2Error);
      // Continue with database deletion even if B2 deletion fails
    }

    await prisma.submissionFile.delete({
      where: { id: fileId }
    });

    return res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const downloadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: {
          include: {
            reviews: {
              where: {
                reviewerId: req.user!.id
              }
            },
            editorAssignments: {
              where: {
                editorId: req.user!.id
              }
            }
          }
        }
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const hasAccess =
      file.submission.authorId === req.user!.id ||
      file.submission.reviews.length > 0 ||
      file.submission.editorAssignments.length > 0 ||
      ['EDITOR', 'ADMIN'].includes(req.user!.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Return the B2 file URL for download
    // The filePath already contains the B2 URL
    return res.json({
      success: true,
      data: {
        url: file.filePath,
        filename: file.originalName
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};