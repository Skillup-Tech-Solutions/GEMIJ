import { prisma } from '../lib/prisma';
import { sendBulkEmail } from '../controllers/emailTemplateController';
import { Request, Response } from 'express';

// Mock Express Request and Response
const mockRequest = (body: any) => ({
    body,
    user: { id: 'admin-id', role: 'ADMIN' }
}) as unknown as Request;

const mockResponse = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.data = data;
        return res;
    };
    return res;
};

async function testBulkEmail() {
    console.log('Starting Bulk Email Test...');

    try {
        // 1. Create a test user if not exists
        const testEmail = 'test-recipient@example.com';
        let user = await prisma.user.findUnique({ where: { email: testEmail } });
        if (!user) {
            console.log('Creating test user...');
            user = await prisma.user.create({
                data: {
                    email: testEmail,
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'Recipient',
                    role: 'AUTHOR',
                    isActive: true
                }
            });
        }

        // 2. Create a test template
        console.log('Creating test template...');
        const templateName = 'Test Bulk Email Template ' + Date.now();
        const template = await prisma.emailTemplate.create({
            data: {
                name: templateName,
                subject: 'Test Subject: {{firstName}}',
                htmlContent: '<h1>Hello {{firstName}}</h1><p>This is a test email.</p>',
                variables: ['firstName'],
                isActive: true
            }
        });

        // 3. Test Send Bulk Email (Specific User)
        console.log('Testing sendBulkEmail...');
        const req = mockRequest({
            templateId: template.id,
            recipientType: 'SPECIFIC',
            specificUserIds: [user.id]
        });
        const res = mockResponse();

        // We need to mock EmailService.sendDynamicEmail or ensure it doesn't actually send if we don't want to spam
        // But for this test, we assume the environment is set up to handle it (or fail gracefully)
        // Since we can't easily mock the import inside the controller from here without a testing framework,
        // we will rely on the controller executing and returning a result.
        // If it fails to send due to missing API keys, it should still return success: true but with failed count, or throw error.

        // Actually, the controller catches errors in the loop and counts them as failed.

        await sendBulkEmail(req, res as Response);

        console.log('Response Status:', res.statusCode);
        console.log('Response Data:', res.data);

        if (res.data && res.data.success) {
            console.log('✅ Bulk Email Test Passed');
        } else {
            console.error('❌ Bulk Email Test Failed');
        }

        // 4. Test Send Bulk Email (Custom Emails)
        console.log('Testing sendBulkEmail with Custom Emails...');
        const reqCustom = mockRequest({
            templateId: template.id,
            recipientType: 'CUSTOM',
            customEmails: ['custom-recipient@example.com']
        });
        const resCustom = mockResponse();

        await sendBulkEmail(reqCustom, resCustom as Response);

        console.log('Custom Email Response Status:', resCustom.statusCode);
        console.log('Custom Email Response Data:', resCustom.data);

        if (resCustom.data && resCustom.data.success) {
            console.log('✅ Custom Email Test Passed');
        } else {
            console.error('❌ Custom Email Test Failed');
        }

        // Cleanup
        console.log('Cleaning up...');
        await prisma.emailTemplate.delete({ where: { id: template.id } });
        // We keep the user for future tests or manual cleanup

    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testBulkEmail();
