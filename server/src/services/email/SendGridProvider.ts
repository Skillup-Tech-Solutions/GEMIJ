import sgMail from '@sendgrid/mail';
import { IEmailProvider, EmailMessage } from './IEmailProvider';

export class SendGridProvider implements IEmailProvider {
    private apiKey: string | undefined;

    constructor() {
        this.apiKey = process.env.SENDGRID_API_KEY;
        // Only set API key if it's a valid SendGrid key (starts with "SG.")
        if (this.apiKey && this.apiKey.startsWith('SG.')) {
            sgMail.setApiKey(this.apiKey);
        } else if (this.apiKey) {
            // Key exists but is invalid (probably a placeholder)
            console.log('[SendGrid] API key found but invalid format (must start with "SG."). Provider disabled.');
            this.apiKey = undefined;
        }
    }

    getName(): string {
        return 'SendGrid';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async sendEmail(message: EmailMessage): Promise<void> {
        if (!this.isConfigured()) {
            throw new Error('SendGrid is not configured. Please set SENDGRID_API_KEY environment variable.');
        }

        try {
            await sgMail.send({
                to: message.to,
                from: {
                    email: message.from.email,
                    name: message.from.name
                },
                subject: message.subject,
                html: message.html,
                text: message.text
            });

            console.log(`[SendGrid] Email sent successfully to ${message.to}`);
        } catch (error: any) {
            console.error('[SendGrid] Email sending failed:', error);
            if (error.response) {
                console.error('[SendGrid] Error response:', error.response.body);
            }
            throw error;
        }
    }
}
