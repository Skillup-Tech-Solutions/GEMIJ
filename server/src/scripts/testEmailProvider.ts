import { EmailService } from '../services/emailService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
    const testRecipient = process.env.TEST_EMAIL || 'test@example.com';

    console.log('='.repeat(60));
    console.log('Email Provider Test');
    console.log('='.repeat(60));
    console.log(`Test recipient: ${testRecipient}`);
    console.log(`EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'auto-select'}`);
    console.log(`SendGrid configured: ${!!process.env.SENDGRID_API_KEY}`);
    console.log(`Mailjet configured: ${!!(process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET)}`);
    console.log('='.repeat(60));
    console.log('');

    try {
        await EmailService.sendEmail({
            to: testRecipient,
            subject: 'Test Email',
            template: 'test_email',
            variables: {
                userName: 'Test User',
                testMessage: 'This is a test email from the GEMIJ Journal system.',
                journalName: process.env.JOURNAL_NAME || 'GEMIJ Journal',
                journalUrl: process.env.JOURNAL_URL || 'https://gemijjournal.online'
            }
        });

        console.log('✅ Test email sent successfully!');
    } catch (error: any) {
        console.error('❌ Test email failed:', error.message);
        process.exit(1);
    }
}

testEmail();
