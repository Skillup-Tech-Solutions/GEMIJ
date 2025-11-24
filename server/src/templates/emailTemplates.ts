import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

// Register Handlebars helpers for conditionals
handlebars.registerHelper('if', function (this: any, conditional: any, options: any) {
  if (conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('gt', function (a: any, b: any) {
  return a > b;
});

// Base template
const baseTemplate = fs.readFileSync(
  path.join(__dirname, 'base.html'),
  'utf-8'
);

const baseCompiled = handlebars.compile(baseTemplate);

// Helper function to wrap content in base template
function wrapInBase(content: string, variables: any): string {
  return baseCompiled({
    ...variables,
    content,
    journalName: variables.journalName || process.env.JOURNAL_NAME || 'GEMIJ Journal',
    supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || 'support@gemij.com',
    currentYear: new Date().getFullYear()
  });
}

interface EmailTemplate {
  subject: string;
  html: (variables: any) => string;
  text: string;
}

// Email template definitions
export const emailTemplates: Record<string, EmailTemplate> = {
  submission_received: {
    subject: 'Submission Received - {{submissionTitle}}',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>Thank you for submitting your manuscript to {{journalName}}. We have successfully received your submission.</p>
      
      <div class="success-box">
        <p><strong>Your submission has been received and is now under initial review.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value"><strong>{{submissionId}}</strong></td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Submitted:</td>
          <td class="value">{{submittedDate}}</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">What happens next?</h3>
      <ol>
        <li>Our editorial team will conduct an initial review of your submission</li>
        <li>If your manuscript passes the initial review, it will be assigned to reviewers</li>
        <li>You will receive updates via email as your submission progresses</li>
      </ol>
      
      <p style="margin-top: 24px;">You can track the status of your submission at any time by logging into your account.</p>
      
      <a href="{{journalUrl}}/author/submissions/{{submissionId}}" class="button">View Submission Status</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        If you have any questions about your submission, please don't hesitate to contact us.
      </p>
    `, variables),
    text: `Dear {{authorName}},

Thank you for submitting your manuscript to {{journalName}}. We have successfully received your submission.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- Submitted: {{submittedDate}}

What happens next?
1. Our editorial team will conduct an initial review of your submission
2. If your manuscript passes the initial review, it will be assigned to reviewers
3. You will receive updates via email as your submission progresses

You can track the status of your submission at any time by logging into your account at:
{{journalUrl}}/author/submissions/{{submissionId}}

If you have any questions, please contact us.

Best regards,
{{journalName}} Editorial Team`
  },

  reviewer_invitation: {
    subject: 'Invitation to Review: {{submissionTitle}}',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{reviewerName}},</h2>
      <p>We would like to invite you to review a manuscript submitted to {{journalName}}. Your expertise makes you an ideal reviewer for this work.</p>
      
      <div class="info-box">
        <p><strong>Manuscript Title:</strong> {{submissionTitle}}</p>
      </div>
      
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Abstract</h3>
      <p style="background-color: #f8fafc; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6;">
        {{submissionAbstract}}
      </p>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Review Due Date:</td>
          <td class="value"><strong>{{dueDate}}</strong></td>
        </tr>
        <tr>
          <td class="label">Expected Time:</td>
          <td class="value">2-3 weeks</td>
        </tr>
      </table>
      
      <p style="margin-top: 24px;">Please accept or decline this invitation at your earliest convenience. If you accept, you will gain access to the full manuscript and review guidelines.</p>
      
      <a href="{{reviewUrl}}" class="button">Accept or Decline Invitation</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        We appreciate your contribution to maintaining the quality of scholarly research. If you are unable to review this manuscript, we would be grateful if you could suggest alternative reviewers.
      </p>
    `, variables),
    text: `Dear {{reviewerName}},

We would like to invite you to review a manuscript submitted to {{journalName}}. Your expertise makes you an ideal reviewer for this work.

Manuscript Title: {{submissionTitle}}

Abstract:
{{submissionAbstract}}

Review Details:
- Due Date: {{dueDate}}
- Expected Time: 2-3 weeks

Please accept or decline this invitation at your earliest convenience:
{{reviewUrl}}

We appreciate your contribution to maintaining the quality of scholarly research.

Best regards,
{{journalName}} Editorial Team`
  },

  review_reminder: {
    subject: 'Reminder: Review Due in {{daysUntilDue}} Days',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{reviewerName}},</h2>
      <p>This is a friendly reminder that your review for the following manuscript is due soon.</p>
      
      <div class="warning-box">
        <p><strong>Review Due Date: {{dueDate}} ({{daysUntilDue}} days remaining)</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Manuscript Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Due Date:</td>
          <td class="value"><strong>{{dueDate}}</strong></td>
        </tr>
      </table>
      
      <p style="margin-top: 24px;">If you need additional time to complete your review, please contact us as soon as possible. We understand that unforeseen circumstances may arise.</p>
      
      <a href="{{reviewUrl}}" class="button">Continue Your Review</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Thank you for your valuable contribution to the peer review process.
      </p>
    `, variables),
    text: `Dear {{reviewerName}},

This is a friendly reminder that your review for the following manuscript is due soon.

Manuscript Title: {{submissionTitle}}
Due Date: {{dueDate}} ({{daysUntilDue}} days remaining)

If you need additional time, please contact us as soon as possible.

Continue your review at:
{{reviewUrl}}

Thank you for your contribution.

Best regards,
{{journalName}} Editorial Team`
  },

  decision_accept: {
    subject: 'Congratulations! Your Manuscript Has Been Accepted',
    html: (variables: any) => {
      let content = `
      <h2>Dear {{authorName}},</h2>
      <p>We are pleased to inform you that your manuscript has been <strong>accepted for publication</strong> in {{journalName}}.</p>
      
      <div class="success-box">
        <p><strong>Your manuscript "{{submissionTitle}}" has been accepted!</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Decision:</td>
          <td class="value"><strong style="color: #10b981;">Accepted</strong></td>
        </tr>
      </table>
      `;

      if (variables.decisionComments) {
        content += `
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Editor's Comments</h3>
      <div class="info-box">
        <p>{{decisionComments}}</p>
      </div>
        `;
      }

      content += `
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Next Steps</h3>
      <ol>
        <li>Complete the Article Processing Charge (APC) payment if applicable</li>
        <li>Review and sign the publication agreement</li>
        <li>Your article will be prepared for publication</li>
      </ol>
      
      <a href="{{submissionUrl}}" class="button">View Submission Details</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Congratulations on this achievement! We look forward to publishing your work.
      </p>
      `;

      return wrapInBase(content, variables);
    },
    text: `Dear {{authorName}},

We are pleased to inform you that your manuscript has been ACCEPTED for publication in {{journalName}}.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- Decision: Accepted

{{#if decisionComments}}
Editor's Comments:
{{decisionComments}}

{{/if}}
Next Steps:
1. Complete the Article Processing Charge (APC) payment if applicable
2. Review and sign the publication agreement
3. Your article will be prepared for publication

View submission details at:
{{submissionUrl}}

Congratulations on this achievement!

Best regards,
{{journalName}} Editorial Team`
  },

  decision_reject: {
    subject: 'Decision on Your Submission: {{submissionTitle}}',
    html: (variables: any) => {
      let content = `
      <h2>Dear {{authorName}},</h2>
      <p>Thank you for submitting your manuscript to {{journalName}}. After careful consideration, we regret to inform you that we are unable to accept your manuscript for publication at this time.</p>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Decision:</td>
          <td class="value"><strong>Not Accepted</strong></td>
        </tr>
      </table>
      `;

      if (variables.decisionComments) {
        content += `
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Editor's Comments</h3>
      <div class="info-box">
        <p>{{decisionComments}}</p>
      </div>
        `;
      }

      if (variables.reviewCount && variables.reviewCount > 0) {
        content += `
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Reviewer Feedback</h3>
      <p>Your submission was reviewed by {{reviewCount}} expert reviewer(s). Their feedback is available in your submission dashboard.</p>
        `;
      }

      content += `
      <p style="margin-top: 24px;">We encourage you to consider the reviewers' feedback and wish you success in placing your work elsewhere. Please note that this decision does not reflect on the quality of your research, but rather on the fit with our journal's current scope and priorities.</p>
      
      <a href="{{submissionUrl}}" class="button-secondary button">View Full Feedback</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Thank you for considering {{journalName}} for your work. We wish you the best in your future research endeavors.
      </p>
      `;

      return wrapInBase(content, variables);
    },
    text: `Dear {{authorName}},

Thank you for submitting your manuscript to {{journalName}}. After careful consideration, we regret to inform you that we are unable to accept your manuscript for publication at this time.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- Decision: Not Accepted

{{#if decisionComments}}
Editor's Comments:
{{decisionComments}}

{{/if}}
{{#if reviewCount}}
Your submission was reviewed by {{reviewCount}} expert reviewer(s). Their feedback is available in your submission dashboard.

{{/if}}
We encourage you to consider the reviewers' feedback and wish you success in placing your work elsewhere.

View full feedback at:
{{submissionUrl}}

Thank you for considering {{journalName}}.

Best regards,
{{journalName}} Editorial Team`
  },

  decision_revision: {
    subject: 'Revisions Required: {{submissionTitle}}',
    html: (variables: any) => {
      let content = `
      <h2>Dear {{authorName}},</h2>
      <p>Thank you for submitting your manuscript to {{journalName}}. After careful review, we would like to invite you to submit a <strong>revised version</strong> of your manuscript.</p>
      
      <div class="info-box">
        <p><strong>Revisions are required before your manuscript can be accepted for publication.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Decision:</td>
          <td class="value"><strong style="color: #f59e0b;">Revisions Required</strong></td>
        </tr>
      </table>
      `;

      if (variables.decisionComments) {
        content += `
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Editor's Comments</h3>
      <div class="info-box">
        <p>{{decisionComments}}</p>
      </div>
        `;
      }

      content += `
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Reviewer Feedback</h3>
      <p>Your submission was reviewed by {{reviewCount}} expert reviewer(s). Please address all reviewer comments in your revision.</p>
      
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Submitting Your Revision</h3>
      <ol>
        <li>Review all feedback carefully</li>
        <li>Prepare your revised manuscript addressing all comments</li>
        <li>Include a point-by-point response to reviewers</li>
        <li>Submit your revision through the submission portal</li>
      </ol>
      
      <a href="{{submissionUrl}}" class="button">View Feedback & Submit Revision</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        We look forward to receiving your revised manuscript. If you have any questions about the required revisions, please don't hesitate to contact us.
      </p>
      `;

      return wrapInBase(content, variables);
    },
    text: `Dear {{authorName}},

Thank you for submitting your manuscript to {{journalName}}. After careful review, we would like to invite you to submit a revised version of your manuscript.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- Decision: Revisions Required

{{#if decisionComments}}
Editor's Comments:
{{decisionComments}}

{{/if}}
Your submission was reviewed by {{reviewCount}} expert reviewer(s). Please address all reviewer comments in your revision.

Submitting Your Revision:
1. Review all feedback carefully
2. Prepare your revised manuscript addressing all comments
3. Include a point-by-point response to reviewers
4. Submit your revision through the submission portal

View feedback and submit revision at:
{{submissionUrl}}

We look forward to receiving your revised manuscript.

Best regards,
{{journalName}} Editorial Team`
  },

  payment_request: {
    subject: 'Article Processing Charge Payment Required',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>Congratulations! Your manuscript has been accepted for publication in {{journalName}}. To proceed with publication, please complete the Article Processing Charge (APC) payment.</p>
      
      <div class="success-box">
        <p><strong>Your manuscript "{{submissionTitle}}" is ready for publication!</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">APC Amount:</td>
          <td class="value"><strong style="font-size: 18px; color: #3b82f6;">{{currency}} {{apcAmount}}</strong></td>
        </tr>
      </table>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Payment Options</h3>
      <ul>
        <li><strong>Online Payment:</strong> Pay securely using credit/debit card or UPI</li>
        <li><strong>Bank Transfer:</strong> Transfer to our designated account</li>
        <li><strong>Payment Proof Upload:</strong> Upload proof of payment for verification</li>
      </ul>
      
      <a href="{{paymentUrl}}" class="button">Complete Payment</a>
      
      <div class="info-box" style="margin-top: 32px;">
        <p><strong>Note:</strong> Your article will be published immediately after payment verification. If you have any questions about payment or require a waiver, please contact us.</p>
      </div>
    `, variables),
    text: `Dear {{authorName}},

Congratulations! Your manuscript has been accepted for publication in {{journalName}}. To proceed with publication, please complete the Article Processing Charge (APC) payment.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- APC Amount: {{currency}} {{apcAmount}}

Payment Options:
- Online Payment: Pay securely using credit/debit card or UPI
- Bank Transfer: Transfer to our designated account
- Payment Proof Upload: Upload proof of payment for verification

Complete payment at:
{{paymentUrl}}

Your article will be published immediately after payment verification.

If you have any questions or require a waiver, please contact us.

Best regards,
{{journalName}} Editorial Team`
  },

  payment_received: {
    subject: 'Payment Received - Thank You!',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>Thank you! We have successfully received your Article Processing Charge (APC) payment.</p>
      
      <div class="success-box">
        <p><strong>Payment confirmed! Your article is now being prepared for publication.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Amount Paid:</td>
          <td class="value"><strong>{{currency}} {{amount}}</strong></td>
        </tr>
        <tr>
          <td class="label">Invoice Number:</td>
          <td class="value">{{invoiceNumber}}</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">What's Next?</h3>
      <ol>
        <li>Your article will undergo final formatting and copyediting</li>
        <li>You will receive a proof for your review and approval</li>
        <li>Once approved, your article will be published online</li>
        <li>You will be notified when your article is published</li>
      </ol>
      
      <p style="margin-top: 24px;">A detailed invoice has been sent to your email and is available in your account dashboard.</p>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Thank you for choosing {{journalName}} for publishing your research. We look forward to sharing your work with the academic community.
      </p>
    `, variables),
    text: `Dear {{authorName}},

Thank you! We have successfully received your Article Processing Charge (APC) payment.

Payment Details:
- Submission Title: {{submissionTitle}}
- Amount Paid: {{currency}} {{amount}}
- Invoice Number: {{invoiceNumber}}

What's Next?
1. Your article will undergo final formatting and copyediting
2. You will receive a proof for your review and approval
3. Once approved, your article will be published online
4. You will be notified when your article is published

A detailed invoice has been sent to your email and is available in your account dashboard.

Thank you for choosing {{journalName}}.

Best regards,
{{journalName}} Editorial Team`
  },

  publication_notification: {
    subject: 'Your Article Has Been Published!',
    html: (variables: any) => {
      let content = `
      <h2>Congratulations!</h2>
      <p>We are delighted to inform you that your article has been <strong>published</strong> in {{journalName}}.</p>
      
      <div class="success-box">
        <p><strong>Your research is now available to the global academic community!</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Article Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">DOI:</td>
          <td class="value"><strong>{{doi}}</strong></td>
        </tr>
      `;

      if (variables.volume) {
        content += `
        <tr>
          <td class="label">Volume/Issue:</td>
          <td class="value">Vol. {{volume}}, Issue {{issue}}</td>
        </tr>
        `;
      }

      if (variables.pages) {
        content += `
        <tr>
          <td class="label">Pages:</td>
          <td class="value">{{pages}}</td>
        </tr>
        `;
      }

      content += `
      </table>
      
      <a href="{{articleUrl}}" class="button">View Published Article</a>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Share Your Work</h3>
      <p>We encourage you to share your published article with colleagues and on social media to maximize its impact.</p>
      

      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Congratulations on this significant achievement! Thank you for contributing to {{journalName}}.
      </p>
      `;

      return wrapInBase(content, variables);
    },
    text: `Congratulations!

We are delighted to inform you that your article has been published in {{journalName}}.

Article Details:
- Title: {{submissionTitle}}
- DOI: {{doi}}
{{#if volume}}- Volume/Issue: Vol. {{volume}}, Issue {{issue}}
{{/if}}{{#if pages}}- Pages: {{pages}}
{{/if}}

View your published article at:
{{articleUrl}}

Share Your Work:
We encourage you to share your published article with colleagues and on social media to maximize its impact.



Congratulations on this significant achievement!

Best regards,
{{journalName}} Editorial Team`
  },

  review_thank_you: {
    subject: 'Thank You for Your Review',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{reviewerName}},</h2>
      <p>Thank you for completing your review of the manuscript "{{submissionTitle}}" for {{journalName}}.</p>
      
      <div class="success-box">
        <p><strong>Your expert feedback is invaluable to maintaining the quality of scholarly research.</strong></p>
      </div>
      
      <p style="margin-top: 24px;">Your thorough and thoughtful review helps authors improve their work and ensures that only high-quality research is published. The academic community greatly benefits from reviewers like you who dedicate their time and expertise.</p>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Review Certificate</h3>
      <p>As a token of our appreciation, we have prepared a certificate of review for your records. This certificate can be used to document your peer review activities.</p>
      
      <a href="{{certificateUrl}}" class="button">Download Certificate</a>
      
      <p style="margin-top: 32px;">We hope to have the opportunity to work with you again in the future. If you would like to update your areas of expertise or review preferences, please log in to your account.</p>
      
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        Thank you once again for your valuable contribution to {{journalName}}.
      </p>
    `, variables),
    text: `Dear {{reviewerName}},

Thank you for completing your review of the manuscript "{{submissionTitle}}" for {{journalName}}.

Your expert feedback is invaluable to maintaining the quality of scholarly research. Your thorough and thoughtful review helps authors improve their work and ensures that only high-quality research is published.

Review Certificate:
As a token of our appreciation, we have prepared a certificate of review for your records.

Download your certificate at:
{{certificateUrl}}

We hope to have the opportunity to work with you again in the future.

Thank you once again for your valuable contribution.

Best regards,
{{journalName}} Editorial Team`
  },

  password_reset: {
    subject: 'Password Reset Request',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{userName}},</h2>
      <p>We received a request to reset the password for your {{journalName}} account.</p>
      
      <div class="warning-box">
        <p><strong>Security Notice:</strong> If you did not request this password reset, please ignore this email and ensure your account is secure.</p>
      </div>
      
      <p style="margin-top: 24px;">To reset your password, click the button below. This link will expire in 1 hour for security reasons.</p>
      
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      
      <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{{resetUrl}}" style="color: #3b82f6; word-break: break-all;">{{resetUrl}}</a>
      </p>
      
      <div class="info-box" style="margin-top: 32px;">
        <p><strong>Security Tips:</strong></p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li>Never share your password with anyone</li>
          <li>Use a strong, unique password</li>
          <li>Enable two-factor authentication if available</li>
        </ul>
      </div>
      
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        If you continue to have problems, please contact our support team.
      </p>
    `, variables),
    text: `Dear {{userName}},

We received a request to reset the password for your {{journalName}} account.

SECURITY NOTICE: If you did not request this password reset, please ignore this email and ensure your account is secure.

To reset your password, visit this link (expires in 1 hour):
{{resetUrl}}

Security Tips:
- Never share your password with anyone
- Use a strong, unique password
- Enable two-factor authentication if available

If you continue to have problems, please contact our support team.

Best regards,
{{journalName}} Support Team`
  },

  review_completed: {
    subject: 'Review Completed: {{submissionTitle}}',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{editorName}},</h2>
      <p>A review has been completed for the submission "{{submissionTitle}}".</p>
      
      <div class="info-box">
        <p><strong>A reviewer has submitted their review and it is now available for your consideration.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Reviewer:</td>
          <td class="value">{{reviewerName}}</td>
        </tr>
        <tr>
          <td class="label">Recommendation:</td>
          <td class="value"><strong>{{recommendation}}</strong></td>
        </tr>
      </table>
      
      <p style="margin-top: 24px;">Please review the feedback and make a decision on this submission. You can view the complete review, including confidential comments, in the editorial dashboard.</p>
      
      <a href="{{submissionUrl}}" class="button">View Review & Make Decision</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        If you have any questions about this review, please contact the editorial office.
      </p>
    `, variables),
    text: `Dear {{editorName}},

A review has been completed for the submission "{{submissionTitle}}".

Review Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- Reviewer: {{reviewerName}}
- Recommendation: {{recommendation}}

Please review the feedback and make a decision on this submission.

View review and make decision at:
{{submissionUrl}}

Best regards,
{{journalName}} Editorial System`
  },

  acceptance_notification: {
    subject: 'Congratulations! Your Submission Has Been Accepted',
    html: (variables: any) => {
      let content = `
      <h2>Dear {{authorName}},</h2>
      <p>We are delighted to inform you that your manuscript has been <strong>accepted for publication</strong> in {{journalName}}!</p>
      
      <div class="success-box">
        <p><strong>Congratulations! "{{submissionTitle}}" will be published in {{journalName}}.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
      </table>
      `;

      if (variables.requiresPayment) {
        content += `
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Next Steps: Payment Required</h3>
      <p>To proceed with publication, please complete the Article Processing Charge (APC) payment of <strong>{{currency}} {{apcAmount}}</strong>.</p>
      <a href="{{paymentUrl}}" class="button">Complete Payment</a>
        `;
      } else {
        content += `
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">Next Steps</h3>
      <p>Your article will now proceed to the production stage. You will receive updates as your article progresses through copyediting and formatting.</p>
        `;
      }

      content += `
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Congratulations on this significant achievement! We look forward to publishing your work and sharing it with the academic community.
      </p>
      `;

      return wrapInBase(content, variables);
    },
    text: `Dear {{authorName}},

We are delighted to inform you that your manuscript has been ACCEPTED for publication in {{journalName}}!

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}

{{#if requiresPayment}}
Next Steps: Payment Required
To proceed with publication, please complete the Article Processing Charge (APC) payment of {{currency}} {{apcAmount}}.

Complete payment at:
{{paymentUrl}}
{{else}}
Next Steps:
Your article will now proceed to the production stage. You will receive updates as your article progresses through copyediting and formatting.
{{/if}}

Congratulations on this significant achievement!

Best regards,
{{journalName}} Editorial Team`
  },

  revision_submitted: {
    subject: 'Revision Submitted: {{submissionTitle}}',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{editorName}},</h2>
      <p>A revised manuscript has been submitted for "{{submissionTitle}}".</p>
      
      <div class="info-box">
        <p><strong>The author has submitted Revision #{{revisionNumber}} for your review.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
        <tr>
          <td class="label">Author:</td>
          <td class="value">{{authorName}}</td>
        </tr>
        <tr>
          <td class="label">Revision Number:</td>
          <td class="value"><strong>#{{revisionNumber}}</strong></td>
        </tr>
      </table>
      
      <p style="margin-top: 24px;">Please review the revised manuscript and the author's response to reviewers. You can then decide whether to accept the revision, request further changes, or send it back to reviewers.</p>
      
      <a href="{{submissionUrl}}" class="button">Review Revision</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        The revised files and author's response are available in the submission dashboard.
      </p>
    `, variables),
    text: `Dear {{editorName}},

A revised manuscript has been submitted for "{{submissionTitle}}".

Revision Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}
- Author: {{authorName}}
- Revision Number: #{{revisionNumber}}

Please review the revised manuscript and the author's response to reviewers.

Review revision at:
{{submissionUrl}}

Best regards,
{{journalName}} Editorial System`
  },

  revision_accepted: {
    subject: 'Your Revision Has Been Accepted',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>We are pleased to inform you that your revised manuscript has been <strong>accepted</strong>!</p>
      
      <div class="success-box">
        <p><strong>Your revision of "{{submissionTitle}}" has been accepted for publication.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{submissionTitle}}</td>
        </tr>
      </table>
      
      <p style="margin-top: 24px;">Thank you for addressing the reviewers' comments. Your manuscript will now proceed to the next stage of the publication process.</p>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">What's Next?</h3>
      <ol>
        <li>Complete any required payments (if applicable)</li>
        <li>Your article will undergo copyediting and formatting</li>
        <li>You will receive a proof for final approval</li>
        <li>Your article will be published online</li>
      </ol>
      
      <a href="{{submissionUrl}}" class="button">View Submission Status</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Congratulations! We look forward to publishing your work in {{journalName}}.
      </p>
    `, variables),
    text: `Dear {{authorName}},

We are pleased to inform you that your revised manuscript has been accepted!

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{submissionTitle}}

Thank you for addressing the reviewers' comments. Your manuscript will now proceed to the next stage of the publication process.

What's Next?
1. Complete any required payments (if applicable)
2. Your article will undergo copyediting and formatting
3. You will receive a proof for final approval
4. Your article will be published online

View submission status at:
{{submissionUrl}}

Congratulations!

Best regards,
{{journalName}} Editorial Team`
  },

  submission_returned_for_formatting: {
    subject: 'Manuscript Returned for Formatting - Action Required',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>Thank you for submitting your manuscript to {{journalName}}. After an initial review, we have identified some formatting issues that need to be addressed before we can proceed with the peer review process.</p>
      
      <div class="warning-box">
        <p><strong>Action Required: Please revise your manuscript formatting and resubmit.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{manuscriptTitle}}</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Formatting Issues</h3>
      <div class="info-box">
        <p>{{comments}}</p>
      </div>
      
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Next Steps</h3>
      <ol>
        <li>Review the formatting requirements in our author guidelines</li>
        <li>Make the necessary corrections to your manuscript</li>
        <li>Resubmit your manuscript through the submission portal</li>
      </ol>
      
      <p style="margin-top: 24px;">Once the formatting issues are resolved, your manuscript will proceed to the peer review process.</p>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        If you have any questions about the formatting requirements, please don't hesitate to contact us.
      </p>
    `, variables),
    text: `Dear {{authorName}},

Thank you for submitting your manuscript to {{journalName}}. After an initial review, we have identified some formatting issues that need to be addressed before we can proceed with the peer review process.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{manuscriptTitle}}

Formatting Issues:
{{comments}}

Next Steps:
1. Review the formatting requirements in our author guidelines
2. Make the necessary corrections to your manuscript
3. Resubmit your manuscript through the submission portal

Once the formatting issues are resolved, your manuscript will proceed to the peer review process.

If you have any questions, please contact us.

Best regards,
{{journalName}} Editorial Team`
  },

  submission_desk_rejected: {
    subject: 'Manuscript Decision - Not Suitable for Review',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>Thank you for submitting your manuscript to {{journalName}}. After careful consideration during our initial screening, we regret to inform you that we are unable to send your manuscript for peer review.</p>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{manuscriptTitle}}</td>
        </tr>
        <tr>
          <td class="label">Decision:</td>
          <td class="value"><strong>Not Suitable for Review</strong></td>
        </tr>
      </table>
      
      <h3 style="margin-top: 24px; font-size: 18px; color: #0f172a;">Editor's Comments</h3>
      <div class="info-box">
        <p>{{editorComments}}</p>
      </div>
      
      <p style="margin-top: 24px;">This decision was made based on our journal's scope and priorities. Please note that this does not reflect on the quality of your research, but rather on the fit with our journal's current editorial direction.</p>
      
      <p style="margin-top: 16px;">We encourage you to consider submitting your work to another journal that may be a better fit for your research topic.</p>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Thank you for considering {{journalName}} for your work. We wish you the best in your future research endeavors.
      </p>
    `, variables),
    text: `Dear {{authorName}},

Thank you for submitting your manuscript to {{journalName}}. After careful consideration during our initial screening, we regret to inform you that we are unable to send your manuscript for peer review.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{manuscriptTitle}}
- Decision: Not Suitable for Review

Editor's Comments:
{{editorComments}}

This decision was made based on our journal's scope and priorities. Please note that this does not reflect on the quality of your research, but rather on the fit with our journal's current editorial direction.

We encourage you to consider submitting your work to another journal that may be a better fit for your research topic.

Thank you for considering {{journalName}}.

Best regards,
{{journalName}} Editorial Team`
  },

  submission_under_review: {
    subject: 'Manuscript Under Review',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{authorName}},</h2>
      <p>We are pleased to inform you that your manuscript has passed the initial screening and is now being sent for peer review.</p>
      
      <div class="success-box">
        <p><strong>Your manuscript "{{manuscriptTitle}}" is now under peer review.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Submission ID:</td>
          <td class="value">{{submissionId}}</td>
        </tr>
        <tr>
          <td class="label">Title:</td>
          <td class="value">{{manuscriptTitle}}</td>
        </tr>
        <tr>
          <td class="label">Status:</td>
          <td class="value"><strong style="color: #f59e0b;">Under Review</strong></td>
        </tr>
      </table>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">What Happens Next?</h3>
      <ol>
        <li>Your manuscript will be reviewed by expert reviewers in your field</li>
        <li>The review process typically takes 2-4 weeks</li>
        <li>You will be notified once all reviews are complete</li>
        <li>The editor will make a decision based on the reviewers' feedback</li>
      </ol>
      
      <div class="info-box" style="margin-top: 24px;">
        <p><strong>Note:</strong> You can track the status of your submission at any time by logging into your account.</p>
      </div>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Thank you for your patience during the review process. We will keep you updated on the progress of your submission.
      </p>
    `, variables),
    text: `Dear {{authorName}},

We are pleased to inform you that your manuscript has passed the initial screening and is now being sent for peer review.

Submission Details:
- Submission ID: {{submissionId}}
- Title: {{manuscriptTitle}}
- Status: Under Review

What Happens Next?
1. Your manuscript will be reviewed by expert reviewers in your field
2. The review process typically takes 2-4 weeks
3. You will be notified once all reviews are complete
4. The editor will make a decision based on the reviewers' feedback

Note: You can track the status of your submission at any time by logging into your account.

Thank you for your patience during the review process.

Best regards,
{{journalName}} Editorial Team`
  },

  accountPendingApproval: {
    subject: 'Account Created - Pending Admin Approval',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{userName}},</h2>
      <p>Thank you for registering with {{journalName}}. Your account has been successfully created.</p>
      
      <div class="info-box">
        <p><strong>Your account is currently pending admin approval.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">Account Status:</td>
          <td class="value"><strong style="color: #f59e0b;">Pending Approval</strong></td>
        </tr>
        <tr>
          <td class="label">Requested Role:</td>
          <td class="value">{{role}}</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 32px; font-size: 18px; color: #0f172a;">What happens next?</h3>
      <ol>
        <li>Our admin team will review your registration request</li>
        <li>You will receive an email notification once your account is approved</li>
        <li>After approval, you will be able to log in and access all features</li>
      </ol>
      
      <p style="margin-top: 24px;">This process typically takes 1-2 business days. If you have any questions or need urgent access, please contact our support team.</p>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        Thank you for your patience. We look forward to having you as part of our community.
      </p>
    `, variables),
    text: `Dear {{userName}},

Thank you for registering with {{journalName}}. Your account has been successfully created.

Account Status: Pending Approval
Requested Role: {{role}}

What happens next?
1. Our admin team will review your registration request
2. You will receive an email notification once your account is approved
3. After approval, you will be able to log in and access all features

This process typically takes 1-2 business days. If you have any questions or need urgent access, please contact our support team.

Thank you for your patience.

Best regards,
{{journalName}} Support Team`
  },

  newUserPendingApproval: {
    subject: 'New User Registration Pending Approval',
    html: (variables: any) => wrapInBase(`
      <h2>Dear {{adminName}},</h2>
      <p>A new user has registered and is awaiting approval to access the system.</p>
      
      <div class="warning-box">
        <p><strong>Action Required: Please review and approve this user registration.</strong></p>
      </div>
      
      <table class="details-table" role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="label">User Name:</td>
          <td class="value"><strong>{{userName}}</strong></td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td class="value">{{userEmail}}</td>
        </tr>
        <tr>
          <td class="label">Requested Role:</td>
          <td class="value"><strong style="color: #3b82f6;">{{userRole}}</strong></td>
        </tr>
      </table>
      
      <p style="margin-top: 24px;">Please log in to the admin dashboard to review this user's information and approve or reject their registration.</p>
      
      <a href="{{journalUrl}}/admin/users" class="button">Review User Registration</a>
      
      <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
        This is an automated notification. Please process this request at your earliest convenience.
      </p>
    `, variables),
    text: `Dear {{adminName}},

A new user has registered and is awaiting approval to access the system.

ACTION REQUIRED: Please review and approve this user registration.

User Details:
- Name: {{userName}}
- Email: {{userEmail}}
- Requested Role: {{userRole}}

Please log in to the admin dashboard to review this user's information and approve or reject their registration.

Admin Dashboard: {{journalUrl}}/admin/users

This is an automated notification. Please process this request at your earliest convenience.

Best regards,
{{journalName}} System`
  }
};

// Export individual template getter
export function getEmailTemplate(templateName: string): EmailTemplate {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  return template;
}

// Export all template names
export const templateNames = Object.keys(emailTemplates);
