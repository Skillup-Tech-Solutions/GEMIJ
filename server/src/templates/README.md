# Email Templates

This directory contains all email templates for the GEMIJ journal system.

## Structure

```
templates/
├── base.html              # Base HTML template with header/footer
├── emailTemplates.ts      # All email template definitions
└── README.md             # This file
```

## Quick Start

### Sending an Email

```typescript
import { EmailService } from '../services/emailService';

// Send any email using the service methods
await EmailService.sendSubmissionReceived('submission-id');
await EmailService.sendReviewerInvitation('review-id');
await EmailService.sendPaymentRequest('submission-id');
```

### Available Templates

| Template Name | Used For |
|--------------|----------|
| `submission_received` | Confirm manuscript submission to author |
| `reviewer_invitation` | Invite reviewer to review a manuscript |
| `review_reminder` | Remind reviewer of approaching deadline |
| `decision_accept` | Notify author of acceptance |
| `decision_reject` | Notify author of rejection |
| `decision_revision` | Request revisions from author |
| `payment_request` | Request APC payment from author |
| `payment_received` | Confirm payment received |
| `publication_notification` | Notify author of publication |
| `review_thank_you` | Thank reviewer for completed review |
| `password_reset` | Send password reset link |
| `review_completed` | Notify editor that review is complete |
| `acceptance_notification` | Notify author of acceptance with payment info |
| `revision_submitted` | Notify editor of revision submission |
| `revision_accepted` | Notify author of revision acceptance |

## Modifying Templates

### 1. Edit Template Content

Open `emailTemplates.ts` and find the template you want to modify:

```typescript
export const emailTemplates = {
  submission_received: {
    subject: 'Submission Received - {{submissionTitle}}',
    html: (variables: any) => wrapInBase(`
      <!-- Your HTML content here -->
      <h2>Dear {{authorName}},</h2>
      <p>Your content...</p>
    `, variables),
    text: `Your plain text version...`
  }
}
```

### 2. Available Variables

Each template has access to specific variables. Check the `emailService.ts` file to see what variables are passed to each template.

Common variables:
- `{{authorName}}` - Author's full name
- `{{submissionTitle}}` - Manuscript title
- `{{submissionId}}` - Submission ID
- `{{journalName}}` - Journal name (from env)
- `{{journalUrl}}` - Journal URL (from env)

### 3. Using Handlebars Syntax

Variables: `{{variableName}}`
Conditionals: `{{#if condition}}...{{/if}}`
Loops: `{{#each items}}...{{/each}}`

### 4. Styling

All styles are inline in `base.html`. Email clients don't support external CSS.

Available CSS classes:
- `.success-box` - Green box for positive messages
- `.info-box` - Blue box for information
- `.warning-box` - Yellow box for warnings
- `.button` - Primary CTA button
- `.button-secondary` - Secondary button
- `.details-table` - Table for displaying details

## Testing

### Run Automated Tests

```bash
npx ts-node src/scripts/testEmailTemplates.ts
```

This will test all templates and verify they compile correctly.

### Manual Testing

1. Update test data in `testEmailTemplates.ts`
2. Run the test script
3. Check the output for any errors
4. Optionally, save HTML output to a file and open in browser

### Testing in Email Clients

To test how emails look in real email clients:

1. Send a test email through the application
2. Check rendering in:
   - Gmail (web and mobile)
   - Outlook (desktop and web)
   - Apple Mail
   - Other clients as needed

## Design Guidelines

### Colors

- Primary: `#3b82f6` (blue-600)
- Secondary: `#64748b` (slate-600)
- Success: `#10b981` (green-500)
- Warning: `#f59e0b` (amber-500)
- Background: `#f8fafc` (slate-50)

### Typography

- Font Family: Inter, system-ui, sans-serif
- Headings: Merriweather (serif)
- Body: 16px, line-height 1.6
- Headings: Bold, tight line-height

### Spacing

- Section spacing: 24-32px
- Paragraph spacing: 16px
- Button margin: 24px

## Troubleshooting

### Template Not Found Error

```
Error: Email template 'template_name' not found
```

**Solution:** Check that the template name in `emailTemplates.ts` matches the name used in `emailService.ts`.

### Variable Not Rendering

```
Email shows: {{variableName}}
```

**Solution:** 
1. Check that the variable is passed in `emailService.ts`
2. Verify the variable name spelling
3. Ensure Handlebars compilation is working

### HTML Not Rendering

**Solution:**
1. Check that DOCTYPE is present
2. Verify inline styles (no external CSS)
3. Test in different email clients
4. Use email-safe HTML (tables for layout)

## Environment Variables

Required environment variables:

```env
JOURNAL_NAME=GEMIJ Journal
JOURNAL_URL=https://gemij.com
FROM_EMAIL=noreply@gemij.com
FROM_NAME=GEMIJ Journal
SUPPORT_EMAIL=support@gemij.com
```

## Best Practices

1. **Always provide plain text version** - Some email clients don't support HTML
2. **Use inline CSS** - External stylesheets don't work in emails
3. **Test in multiple clients** - Rendering varies significantly
4. **Keep it simple** - Complex layouts may break
5. **Use tables for layout** - Flexbox/Grid not supported in emails
6. **Optimize images** - Use absolute URLs, provide alt text
7. **Include unsubscribe option** - Required for bulk emails
8. **Mobile-first design** - Most emails are read on mobile

## Support

For questions or issues:
- Check the walkthrough: `/.gemini/antigravity/brain/.../walkthrough.md`
- Review test script: `src/scripts/testEmailTemplates.ts`
- Contact: [Your contact information]
