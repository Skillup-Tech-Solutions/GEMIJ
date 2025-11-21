# SendGrid Test Email Utility

This utility allows you to send test emails using SendGrid API.

## Configuration

- **API Key**: `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`
- **From Email**: `gemij@ahamednazeer.qzz.io`

## Usage

### Basic Test Email

```bash
cd server
npm run test-email recipient@example.com
```

### Custom Subject and Message

```bash
npm run test-email recipient@example.com "Custom Subject" "Your custom message here"
```

### Examples

```bash
# Send a basic test email
npm run test-email john@example.com

# Send with custom subject
npm run test-email jane@example.com "Welcome to GEMIJ"

# Send with custom subject and message
npm run test-email admin@example.com "Test Email" "This is a test message from GEMIJ system"
```

## Files Created

1. **`src/utils/sendTestEmail.ts`** - Core SendGrid email utility
2. **`testEmail.ts`** - CLI wrapper for easy testing
3. **`package.json`** - Added `test-email` script

## Integration

The `sendTestEmail` function can be imported and used in your application:

```typescript
import { sendTestEmail } from './src/utils/sendTestEmail';

await sendTestEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Plain text message',
  html: '<p>HTML message</p>'
});
```

## Next Steps

To integrate SendGrid into your existing email service:

1. Update `src/services/emailService.ts` to use SendGrid instead of nodemailer
2. Add `SENDGRID_API_KEY` and `FROM_EMAIL` to your `.env` file
3. Update email templates to work with SendGrid
