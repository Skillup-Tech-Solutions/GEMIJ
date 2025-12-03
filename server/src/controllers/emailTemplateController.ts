import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/emailService';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '@prisma/client';

// Get all email templates
export const getEmailTemplates = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        return res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Get email templates error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Create a new email template
export const createEmailTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, subject, htmlContent, textContent, variables } = req.body;

        if (!name || !subject || !htmlContent) {
            return res.status(400).json({
                success: false,
                error: 'Name, subject, and HTML content are required'
            });
        }

        const existingTemplate = await prisma.emailTemplate.findUnique({
            where: { name }
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                error: 'Template with this name already exists'
            });
        }

        const template = await prisma.emailTemplate.create({
            data: {
                name,
                subject,
                htmlContent,
                textContent,
                variables: variables || [],
                isActive: true
            }
        });

        return res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Create email template error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Update an email template
export const updateEmailTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, subject, htmlContent, textContent, variables, isActive } = req.body;

        const template = await prisma.emailTemplate.update({
            where: { id },
            data: {
                name,
                subject,
                htmlContent,
                textContent,
                variables,
                isActive
            }
        });

        return res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Update email template error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Delete an email template
export const deleteEmailTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.emailTemplate.delete({
            where: { id }
        });

        return res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Delete email template error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Send bulk email
export const sendBulkEmail = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { templateId, recipientType, specificUserIds, customEmails, subjectOverride } = req.body;

        if (!templateId || !recipientType) {
            return res.status(400).json({
                success: false,
                error: 'Template ID and recipient type are required'
            });
        }

        // Fetch the template
        const template = await prisma.emailTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }

        // Determine recipients
        let recipients: { email: string; firstName: string; lastName: string }[] = [];

        if (recipientType === 'CUSTOM') {
            if (!customEmails || !Array.isArray(customEmails) || customEmails.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Custom emails are required for CUSTOM recipient type'
                });
            }

            // Validate emails
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const validEmails = customEmails.filter(email => emailRegex.test(email));

            if (validEmails.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid email addresses provided'
                });
            }

            recipients = validEmails.map(email => ({
                email,
                firstName: 'Valued',
                lastName: 'User'
            }));

        } else if (recipientType === 'SPECIFIC') {
            if (!specificUserIds || !Array.isArray(specificUserIds) || specificUserIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Specific user IDs are required for SPECIFIC recipient type'
                });
            }

            const users = await prisma.user.findMany({
                where: {
                    id: { in: specificUserIds },
                    isActive: true
                },
                select: { email: true, firstName: true, lastName: true }
            });
            recipients = users;

        } else if (recipientType === 'ALL_AUTHORS') {
            const users = await prisma.user.findMany({
                where: {
                    role: UserRole.AUTHOR,
                    isActive: true
                },
                select: { email: true, firstName: true, lastName: true }
            });
            recipients = users;

        } else if (recipientType === 'ALL_REVIEWERS') {
            const users = await prisma.user.findMany({
                where: {
                    role: UserRole.REVIEWER,
                    isActive: true
                },
                select: { email: true, firstName: true, lastName: true }
            });
            recipients = users;

        } else if (recipientType === 'ALL_USERS') {
            const users = await prisma.user.findMany({
                where: { isActive: true },
                select: { email: true, firstName: true, lastName: true }
            });
            recipients = users;
        }

        if (recipients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No recipients found'
            });
        }

        // Send emails in background (or loop here if list is small enough, but background is better for large lists)
        // For now, we'll loop here but with error handling so one failure doesn't stop the rest
        // In a production system with thousands of users, this should be a queue job.

        let successCount = 0;
        let failureCount = 0;

        // Use the EmailService to send emails. 
        // Note: EmailService.sendEmail expects a template name key from emailTemplates.ts usually, 
        // but we want to use our dynamic database template.
        // We need to extend EmailService or handle the sending logic here using the provider directly 
        // OR modify EmailService to accept raw HTML/Subject.

        // Looking at EmailService.ts, it imports templates from a file. 
        // We should probably add a method to EmailService to send a "Dynamic" email where we pass the HTML/Subject directly.
        // However, since I can't easily modify the EmailService to support dynamic templates without potentially breaking things or making it complex,
        // I will use the provider directly here if possible, or better, add a `sendDynamicEmail` to EmailService.

        // Let's check EmailService again. It uses `getEmailProvider()` which is not exported.
        // But `EmailService` class is exported.

        // I will add `sendDynamicEmail` to `EmailService` in a separate edit. 
        // For now, I'll assume `EmailService.sendDynamicEmail` exists or I'll implement it in the next step.
        // Actually, I should implement `EmailService.sendDynamicEmail` first or in parallel.

        // Wait, I can't modify EmailService in this same turn if I want to use it here.
        // I will write this controller assuming `EmailService.sendDynamicEmail` will be available.

        // Actually, I can just use the `sendEmail` method if I pass a special template name or if I modify it.
        // Let's modify `EmailService` to accept `html` and `subject` overrides in the `data` object.

        // Re-reading EmailService.ts:
        // static async sendEmail(data: EmailTemplateData): Promise<void> { ... }
        // It looks up the template.

        // I will modify EmailService to allow passing `html` and `subject` directly in `EmailTemplateData` 
        // and if present, skip the template lookup.

        // So, back to this controller. I will use `EmailService.sendEmail` with a new `dynamic` flag or similar.

        // Let's pause writing this file and modify EmailService first? 
        // No, I can write this file, and then modify EmailService.

        // I'll use a hypothetical `sendDynamicEmail` for now and implement it in EmailService.

        const journalName = process.env.JOURNAL_NAME || 'GEMIJ Journal';
        const journalUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        // We'll process in chunks to avoid overwhelming the server/provider
        const chunkSize = 50;
        for (let i = 0; i < recipients.length; i += chunkSize) {
            const chunk = recipients.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (recipient) => {
                try {
                    const variables = {
                        firstName: recipient.firstName,
                        lastName: recipient.lastName,
                        email: recipient.email,
                        journalName,
                        journalUrl
                    };

                    // We will implement this method in EmailService
                    await EmailService.sendDynamicEmail({
                        to: recipient.email,
                        subject: subjectOverride || template.subject,
                        html: template.htmlContent,
                        text: template.textContent || undefined,
                        variables
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send email to ${recipient.email}:`, error);
                    failureCount++;
                }
            }));
        }

        return res.json({
            success: true,
            data: {
                total: recipients.length,
                sent: successCount,
                failed: failureCount
            }
        });

    } catch (error) {
        console.error('Send bulk email error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
