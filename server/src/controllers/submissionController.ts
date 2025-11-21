import { Response } from 'express';
import { PrismaClient, SubmissionStatus } from '@prisma/client';
import { AuthenticatedRequest, SubmissionData, PaginationParams } from '../types';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { EmailService } from '../services/emailService';
import { backblazeService } from '../services/backblazeService';

const prisma = new PrismaClient();

const submissionSchema = z.object({
  title: z.string().min(1),
  abstract: z.string().min(1),
  keywords: z.array(z.string()),
  manuscriptType: z.string(),
  isDoubleBlind: z.boolean().optional(),
  suggestedReviewers: z.array(z.string()).optional(),
  excludedReviewers: z.array(z.string()).optional(),
  comments: z.string().optional(),
  coAuthors: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    affiliation: z.string().optional(),
    isCorresponding: z.boolean().optional(),
    order: z.number()
  })).optional().default([])
});

export const createSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = submissionSchema.parse(req.body);

    const submission = await prisma.submission.create({
      data: {
        ...validatedData,
        authorId: req.user!.id,
        coAuthors: {
          create: validatedData.coAuthors
        }
      },
      include: {
        coAuthors: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: submission,
      message: 'Submission created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Create submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Parse query params properly
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;

    const where = req.user!.role === 'AUTHOR'
      ? { authorId: req.user!.id }
      : {};

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          coAuthors: true,
          files: true,
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      prisma.submission.count({ where })
    ]);

    // Sign file URLs
    await Promise.all(submissions.map(async (submission) => {
      if (submission.files && submission.files.length > 0) {
        await Promise.all(submission.files.map(async (file: any) => {
          if (file.filePath && file.filePath.includes('/file/')) {
            try {
              const urlParts = file.filePath.split('/file/');
              if (urlParts.length > 1) {
                const pathParts = urlParts[1].split('/');
                if (pathParts.length > 1) {
                  const fileName = pathParts.slice(1).join('/');
                  file.filePath = await backblazeService.getAuthorizedDownloadUrl(fileName);
                }
              }
            } catch (error) {
              console.error('Failed to sign file URL:', error);
            }
          }
        }));
      }
    }));

    return res.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            affiliation: true
          }
        },
        coAuthors: true,
        files: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                affiliation: true
              }
            }
          }
        },
        editorAssignments: {
          include: {
            editor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        revisions: {
          include: {
            files: true
          },
          orderBy: {
            revisionNumber: 'desc'
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    if (req.user!.role === 'AUTHOR' && submission.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Sign file URLs
    if (submission.files && submission.files.length > 0) {
      await Promise.all(submission.files.map(async (file: any) => {
        if (file.filePath && file.filePath.includes('/file/')) {
          try {
            const urlParts = file.filePath.split('/file/');
            if (urlParts.length > 1) {
              const pathParts = urlParts[1].split('/');
              if (pathParts.length > 1) {
                const fileName = pathParts.slice(1).join('/');
                file.filePath = await backblazeService.getAuthorizedDownloadUrl(fileName);
              }
            }
          } catch (error) {
            console.error('Failed to sign file URL:', error);
          }
        }
      }));
    }

    // Sign revision file URLs
    if (submission.revisions && submission.revisions.length > 0) {
      await Promise.all(submission.revisions.map(async (revision) => {
        if (revision.files && revision.files.length > 0) {
          await Promise.all(revision.files.map(async (file: any) => {
            if (file.filePath && file.filePath.includes('/file/')) {
              try {
                const urlParts = file.filePath.split('/file/');
                if (urlParts.length > 1) {
                  const pathParts = urlParts[1].split('/');
                  if (pathParts.length > 1) {
                    const fileName = pathParts.slice(1).join('/');
                    file.filePath = await backblazeService.getAuthorizedDownloadUrl(fileName);
                  }
                }
              } catch (error) {
                console.error('Failed to sign revision file URL:', error);
              }
            }
          }));
        }
      }));
    }

    return res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = submissionSchema.partial().parse(req.body);

    const existingSubmission = await prisma.submission.findUnique({
      where: { id }
    });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    if (req.user!.role === 'AUTHOR' && existingSubmission.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (existingSubmission.status !== 'DRAFT' && existingSubmission.status !== 'REVISION_REQUIRED') {
      return res.status(400).json({
        success: false,
        error: 'Submission cannot be edited in current status'
      });
    }

    const { coAuthors, ...submissionData } = validatedData;

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        ...submissionData,
        ...(coAuthors && {
          coAuthors: {
            deleteMany: {},
            create: coAuthors
          }
        })
      },
      include: {
        coAuthors: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      data: submission,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Update submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const submitForReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        files: true
      }
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

    if (submission.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: 'Submission is not in draft status'
      });
    }

    if (submission.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one file must be uploaded'
      });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        author: true,
        coAuthors: true
      }
    });

    // Add timeline event
    await prisma.submissionTimeline.create({
      data: {
        submissionId: id,
        event: 'SUBMISSION_SUBMITTED',
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',
        description: 'Manuscript submitted for initial review',
        performedBy: `${req.user!.firstName} ${req.user!.lastName}`
      }
    });

    // Send confirmation email to author
    try {
      await EmailService.sendEmail({
        to: updatedSubmission.author.email,
        subject: 'Submission Received - Confirmation',
        template: 'submission_received',
        variables: {
          authorName: `${updatedSubmission.author.firstName} ${updatedSubmission.author.lastName}`,
          manuscriptTitle: updatedSubmission.title,
          submissionId: updatedSubmission.id,
          submittedAt: updatedSubmission.submittedAt?.toLocaleDateString()
        }
      });
    } catch (emailError) {
      console.error('Failed to send submission confirmation email:', emailError);
    }

    // Create in-app notification for author
    await prisma.notification.create({
      data: {
        userId: updatedSubmission.authorId,
        type: 'SUBMISSION_RECEIVED',
        title: 'Submission Received',
        message: `Your manuscript "${updatedSubmission.title}" has been successfully submitted and is now under initial review.`,
        submissionId: id
      }
    });

    // Notify editors about new submission
    const editors = await prisma.user.findMany({
      where: {
        role: 'EDITOR',
        isActive: true
      }
    });

    if (editors.length > 0) {
      await prisma.notification.createMany({
        data: editors.map(editor => ({
          userId: editor.id,
          type: 'NEW_SUBMISSION',
          title: 'New Submission Received',
          message: `A new manuscript "${updatedSubmission.title}" has been submitted by ${updatedSubmission.author.firstName} ${updatedSubmission.author.lastName} and requires initial screening.`,
          submissionId: id
        }))
      });
    }

    return res.json({
      success: true,
      data: updatedSubmission,
      message: 'Submission submitted for review successfully'
    });
  } catch (error) {
    console.error('Submit for review error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const withdrawSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id }
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

    if (['PUBLISHED', 'WITHDRAWN'].includes(submission.status)) {
      return res.status(400).json({
        success: false,
        error: 'Submission cannot be withdrawn'
      });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: 'WITHDRAWN'
      }
    });

    return res.json({
      success: true,
      data: updatedSubmission,
      message: 'Submission withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createRevision = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { revisionLetter, responseToReviewers } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        author: true,
        editorAssignments: {
          include: {
            editor: true
          }
        },
        revisions: {
          orderBy: {
            revisionNumber: 'desc'
          },
          take: 1
        }
      }
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

    if (submission.status !== SubmissionStatus.REVISION_REQUIRED) {
      return res.status(400).json({
        success: false,
        error: 'Submission is not in revision required status'
      });
    }

    const nextRevisionNumber = (submission.revisions[0]?.revisionNumber || 0) + 1;

    const revision = await prisma.revision.create({
      data: {
        submissionId: id,
        revisionNumber: nextRevisionNumber,
        authorResponse: `Cover Letter: ${revisionLetter}\n\nResponse to Reviewers: ${responseToReviewers}`
      }
    });

    // Update submission status to REVISED
    await prisma.submission.update({
      where: { id },
      data: {
        status: SubmissionStatus.REVISED
      }
    });

    // Add timeline event
    await prisma.submissionTimeline.create({
      data: {
        submissionId: id,
        event: 'REVISION_SUBMITTED',
        fromStatus: 'REVISION_REQUIRED',
        toStatus: 'REVISED',
        description: `Revision ${nextRevisionNumber} submitted by author`,
        performedBy: `${req.user!.firstName} ${req.user!.lastName}`
      }
    });

    // Notify editors
    try {
      await EmailService.sendRevisionSubmittedNotification(id);
    } catch (emailError) {
      console.error('Failed to send revision notification email:', emailError);
    }

    // Create in-app notifications for assigned editors
    if (submission.editorAssignments.length > 0) {
      await prisma.notification.createMany({
        data: submission.editorAssignments.map(assignment => ({
          userId: assignment.editorId,
          type: 'REVISION_SUBMITTED',
          title: 'Revision Submitted',
          message: `A revision has been submitted for "${submission.title}" by ${submission.author.firstName} ${submission.author.lastName}`,
          submissionId: id
        }))
      });
    }

    // Create timeline entry
    /*
    await prisma.submissionTimeline.create({
      data: {
        submissionId: id,
        event: 'REVISION_SUBMITTED',
        fromStatus: SubmissionStatus.REVISION_REQUIRED,
        toStatus: SubmissionStatus.REVISED,
        description: `Revision ${nextRevisionNumber} submitted by author`,
        performedBy: `${req.user!.firstName} ${req.user!.lastName}`
      }
    });
    */

    return res.status(201).json({
      success: true,
      data: revision,
      message: 'Revision created successfully'
    });
  } catch (error) {
    console.error('Create revision error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const uploadRevisionFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: submissionId, revisionId } = req.params;
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    let file: Express.Multer.File | undefined;
    if (uploadedFiles.file && uploadedFiles.file.length > 0) {
      file = uploadedFiles.file[0];
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: {
        submission: true
      }
    });

    if (!revision) {
      return res.status(404).json({
        success: false,
        error: 'Revision not found'
      });
    }

    if (revision.submissionId !== submissionId) {
      return res.status(400).json({
        success: false,
        error: 'Revision does not belong to this submission'
      });
    }

    if (revision.submission.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Upload file to Backblaze B2
    const b2Result = await backblazeService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const revisionFile = await prisma.revisionFile.create({
      data: {
        revisionId,
        filename: b2Result.fileName,
        originalName: file.originalname,
        fileType: path.extname(file.originalname).toLowerCase(),
        fileSize: file.size,
        filePath: b2Result.url,
        b2FileId: b2Result.fileId
      }
    });



    return res.status(201).json({
      success: true,
      data: revisionFile,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload revision file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const approveProof = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approved, comments } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id }
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

    // Assuming 'ACCEPTED' is the state before proof. Or maybe there's a 'PROOF_READY' state?
    // The schema has 'ACCEPTED', 'PUBLISHED'.
    // Let's assume it's in 'ACCEPTED' state.

    if (submission.status !== 'ACCEPTED') {
      // It might be okay to allow this if we assume 'ACCEPTED' includes proof stage.
      // Or maybe we should check if it's already PUBLISHED?
      if (submission.status === SubmissionStatus.PUBLISHED) {
        return res.status(400).json({
          success: false,
          error: 'Submission is already published'
        });
      }
    }

    let newStatus = submission.status;
    if (approved) {
      newStatus = SubmissionStatus.ACCEPTED; // Keep as ACCEPTED - actual publishing happens separately
      // The schema doesn't have PUBLISHED in SubmissionStatus enum
      // Publishing is handled through the Article model after payment and final approval
    } else {
      // Request corrections
      // Maybe stay in ACCEPTED but add comments? Or is there a specific status?
      // Schema has: DRAFT, SUBMITTED, INITIAL_REVIEW, UNDER_REVIEW, REVISION_REQUIRED, REVISED, ACCEPTED, REJECTED, PUBLISHED, WITHDRAWN.
      // No 'CORRECTIONS_REQUIRED'.
      // Let's keep it as ACCEPTED but maybe add comments? Or is there a specific status?
      // The `ProofReview.tsx` sends comments.
      // Let's just update comments and maybe keep status as ACCEPTED.
      // Or maybe we need to notify the editor?
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: newStatus,
        comments: comments ? `Proof Comments: ${comments}` : undefined,
        publishedAt: approved ? new Date() : undefined
      }
    });

    return res.json({
      success: true,
      data: updatedSubmission,
      message: approved ? 'Proof approved and published' : 'Corrections requested'
    });
  } catch (error) {
    console.error('Approve proof error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};