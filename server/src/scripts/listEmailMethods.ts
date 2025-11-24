import { EmailService } from '../services/emailService';

console.log('\n' + '='.repeat(70));
console.log('EMAIL SERVICE - ALL AVAILABLE EMAIL METHODS');
console.log('='.repeat(70));

const emailMethods = [
    {
        method: 'sendSubmissionReceived',
        description: 'Sent to author when submission is received',
        template: 'submission_received',
        trigger: 'After author submits manuscript'
    },
    {
        method: 'sendReviewerInvitation',
        description: 'Sent to reviewer when invited to review',
        template: 'reviewer_invitation',
        trigger: 'When editor assigns reviewer'
    },
    {
        method: 'sendReviewReminder',
        description: 'Reminder to reviewer about pending review',
        template: 'review_reminder',
        trigger: 'Automated reminder before due date'
    },
    {
        method: 'sendDecisionToAuthor',
        description: 'Editorial decision sent to author',
        template: 'decision_accept / decision_reject / decision_revision',
        trigger: 'When editor makes final decision'
    },
    {
        method: 'sendPaymentRequest',
        description: 'APC payment request to author',
        template: 'payment_request',
        trigger: 'After manuscript acceptance'
    },
    {
        method: 'sendPaymentReceivedNotification',
        description: 'Payment confirmation to author',
        template: 'payment_received',
        trigger: 'After successful payment'
    },
    {
        method: 'sendPublicationNotification',
        description: 'Article published notification',
        template: 'publication_notification',
        trigger: 'When article is published'
    },
    {
        method: 'sendReviewThankYou',
        description: 'Thank you to reviewer after completing review',
        template: 'review_thank_you',
        trigger: 'After reviewer submits review'
    },
    {
        method: 'sendPasswordResetEmail',
        description: 'Password reset link',
        template: 'password_reset',
        trigger: 'When user requests password reset'
    },
    {
        method: 'sendReviewCompletedNotification',
        description: 'Notify editor that review is completed',
        template: 'review_completed',
        trigger: 'After reviewer submits review'
    },
    {
        method: 'sendDecisionNotification',
        description: 'Decision notification with reviewer comments',
        template: 'decision_accept / decision_reject / decision_revision',
        trigger: 'When editor makes decision'
    },
    {
        method: 'sendAcceptanceNotification',
        description: 'Acceptance notification with payment info',
        template: 'acceptance_notification',
        trigger: 'When manuscript is accepted'
    },
    {
        method: 'sendRevisionSubmittedNotification',
        description: 'Notify editor that revision is submitted',
        template: 'revision_submitted',
        trigger: 'When author submits revision'
    },
    {
        method: 'sendRevisionAcceptedNotification',
        description: 'Notify author that revision is accepted',
        template: 'revision_accepted',
        trigger: 'When editor accepts revision'
    }
];

console.log('\nCurrent Email Configuration:');
console.log('-'.repeat(70));
console.log(`EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'auto-select'}`);
console.log(`SendGrid configured: ${!!process.env.SENDGRID_API_KEY}`);
console.log(`Mailjet configured: ${!!(process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET)}`);
console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'not set'}`);
console.log(`FROM_NAME: ${process.env.FROM_NAME || 'not set'}`);
console.log('');

console.log('\nAvailable Email Methods:');
console.log('-'.repeat(70));

emailMethods.forEach((email, index) => {
    console.log(`\n${index + 1}. ${email.method}()`);
    console.log(`   Description: ${email.description}`);
    console.log(`   Template: ${email.template}`);
    console.log(`   Trigger: ${email.trigger}`);
});

console.log('\n' + '='.repeat(70));
console.log(`Total: ${emailMethods.length} email methods available`);
console.log('='.repeat(70) + '\n');

console.log('\nUsage Example:');
console.log('-'.repeat(70));
console.log('import { EmailService } from "./services/emailService";');
console.log('');
console.log('// Send submission received email');
console.log('await EmailService.sendSubmissionReceived(submissionId);');
console.log('');
console.log('// Send reviewer invitation');
console.log('await EmailService.sendReviewerInvitation(reviewId);');
console.log('-'.repeat(70) + '\n');
