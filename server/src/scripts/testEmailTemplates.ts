/**
 * Test script to verify email templates compile correctly
 * Run with: npx ts-node src/scripts/testEmailTemplates.ts
 */

import { getEmailTemplate, templateNames } from '../templates/emailTemplates';
import handlebars from 'handlebars';

console.log('🧪 Testing Email Templates...\n');

// Test data for each template
const testData: Record<string, any> = {
    submission_received: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        submittedDate: new Date().toLocaleDateString(),
        journalName: 'GEMIJ Journal',
        journalUrl: 'https://gemij.com'
    },
    reviewer_invitation: {
        reviewerName: 'Prof. Jane Smith',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionAbstract: 'This paper presents novel approaches to machine learning...',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        reviewUrl: 'https://gemij.com/reviewer/reviews/REV-001',
        journalName: 'GEMIJ Journal'
    },
    review_reminder: {
        reviewerName: 'Prof. Jane Smith',
        submissionTitle: 'Advanced Machine Learning Techniques',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        daysUntilDue: 3,
        reviewUrl: 'https://gemij.com/reviewer/reviews/REV-001',
        journalName: 'GEMIJ Journal'
    },
    decision_accept: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        decision: 'ACCEPTED',
        decisionComments: 'Your manuscript has been accepted with minor revisions.',
        submissionUrl: 'https://gemij.com/author/submissions/SUB-2024-001',
        journalName: 'GEMIJ Journal'
    },
    decision_reject: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        decision: 'REJECTED',
        decisionComments: 'Unfortunately, your manuscript does not fit our current scope.',
        reviewCount: 2,
        submissionUrl: 'https://gemij.com/author/submissions/SUB-2024-001',
        journalName: 'GEMIJ Journal'
    },
    decision_revision: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        decision: 'REVISION_REQUIRED',
        decisionComments: 'Please address the reviewer comments and resubmit.',
        reviewCount: 2,
        submissionUrl: 'https://gemij.com/author/submissions/SUB-2024-001',
        journalName: 'GEMIJ Journal'
    },
    payment_request: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        apcAmount: '10,000',
        currency: 'INR',
        paymentUrl: 'https://gemij.com/author/submissions/SUB-2024-001/payment',
        journalName: 'GEMIJ Journal'
    },
    payment_received: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        amount: '10,000',
        currency: 'INR',
        invoiceNumber: 'INV-2024-001',
        journalName: 'GEMIJ Journal'
    },
    publication_notification: {
        submissionTitle: 'Advanced Machine Learning Techniques',
        doi: '10.1234/gemij.2024.001',
        volume: 1,
        issue: 1,
        pages: '1-15',
        articleUrl: 'https://gemij.com/articles/10.1234/gemij.2024.001',
        journalName: 'GEMIJ Journal'
    },
    review_thank_you: {
        reviewerName: 'Prof. Jane Smith',
        submissionTitle: 'Advanced Machine Learning Techniques',
        certificateUrl: 'https://gemij.com/reviewer/reviews/REV-001/certificate',
        journalName: 'GEMIJ Journal'
    },
    password_reset: {
        userName: 'Dr. John Doe',
        resetUrl: 'https://gemij.com/reset-password?token=abc123',
        journalName: 'GEMIJ Journal'
    },
    review_completed: {
        editorName: 'Dr. Editor',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        reviewerName: 'Prof. Jane Smith',
        recommendation: 'ACCEPT',
        submissionUrl: 'https://gemij.com/editor/submission/SUB-2024-001',
        journalName: 'GEMIJ Journal'
    },
    acceptance_notification: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        requiresPayment: true,
        apcAmount: '10,000',
        currency: 'INR',
        paymentUrl: 'https://gemij.com/author/submissions/SUB-2024-001/payment',
        journalName: 'GEMIJ Journal'
    },
    revision_submitted: {
        editorName: 'Dr. Editor',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        authorName: 'Dr. John Doe',
        revisionNumber: 1,
        submissionUrl: 'https://gemij.com/editor/submission/SUB-2024-001/revision',
        journalName: 'GEMIJ Journal'
    },
    revision_accepted: {
        authorName: 'Dr. John Doe',
        submissionTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        submissionUrl: 'https://gemij.com/author/submissions/SUB-2024-001',
        journalName: 'GEMIJ Journal'
    },
    submission_returned_for_formatting: {
        authorName: 'Dr. John Doe',
        manuscriptTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        comments: 'Please ensure your manuscript follows our formatting guidelines: use 12pt Times New Roman font, double-spacing, and include line numbers.',
        journalName: 'GEMIJ Journal'
    },
    submission_desk_rejected: {
        authorName: 'Dr. John Doe',
        manuscriptTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        editorComments: 'While your research is interesting, it falls outside the current scope of our journal. We recommend submitting to a specialized machine learning journal.',
        journalName: 'GEMIJ Journal'
    },
    submission_under_review: {
        authorName: 'Dr. John Doe',
        manuscriptTitle: 'Advanced Machine Learning Techniques',
        submissionId: 'SUB-2024-001',
        journalName: 'GEMIJ Journal'
    }
};

let successCount = 0;
let failureCount = 0;

// Test each template
for (const templateName of templateNames) {
    try {
        console.log(`Testing: ${templateName}`);

        const template = getEmailTemplate(templateName);
        const data = testData[templateName];

        if (!data) {
            console.log(`  ⚠️  No test data defined for ${templateName}`);
            continue;
        }

        // Compile subject
        const subject = handlebars.compile(template.subject)(data);
        console.log(`  ✓ Subject: ${subject}`);

        // Compile HTML
        const html = template.html(data);
        console.log(`  ✓ HTML compiled (${html.length} characters)`);

        // Compile text
        const text = handlebars.compile(template.text)(data);
        console.log(`  ✓ Text compiled (${text.length} characters)`);

        // Basic validation
        if (!html.includes('<!DOCTYPE html>')) {
            throw new Error('HTML does not include DOCTYPE');
        }

        if (!html.includes(data.journalName || 'GEMIJ')) {
            throw new Error('HTML does not include journal name');
        }

        console.log(`  ✅ ${templateName} - PASSED\n`);
        successCount++;

    } catch (error: any) {
        console.log(`  ❌ ${templateName} - FAILED: ${error.message}\n`);
        failureCount++;
    }
}

console.log('═'.repeat(50));
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${successCount}/${templateNames.length}`);
console.log(`   ❌ Failed: ${failureCount}/${templateNames.length}`);

if (failureCount === 0) {
    console.log('\n🎉 All email templates are working correctly!');
    process.exit(0);
} else {
    console.log('\n⚠️  Some templates failed. Please review the errors above.');
    process.exit(1);
}
