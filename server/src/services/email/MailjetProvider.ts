import Mailjet from 'node-mailjet';
import { IEmailProvider, EmailMessage } from './IEmailProvider';

export class MailjetProvider implements IEmailProvider {
    private client: Mailjet | null = null;
    private apiKey: string | undefined;
    private apiSecret: string | undefined;

    constructor() {
        this.apiKey = process.env.MAILJET_API_KEY;
        this.apiSecret = process.env.MAILJET_API_SECRET;

        if (this.apiKey && this.apiSecret) {
            this.client = new Mailjet({
                apiKey: this.apiKey,
                apiSecret: this.apiSecret
            });
        }
    }

    getName(): string {
        return 'Mailjet';
    }

    isConfigured(): boolean {
        return !!(this.apiKey && this.apiSecret && this.client);
    }

    async sendEmail(message: EmailMessage): Promise<void> {
        if (!this.isConfigured() || !this.client) {
            throw new Error('Mailjet is not configured. Please set MAILJET_API_KEY and MAILJET_API_SECRET environment variables.');
        }

        try {
            console.log(`[Mailjet] Sending email from: ${message.from.email} (${message.from.name})`);
            console.log(`[Mailjet] Sending email to: ${message.to}`);

            const request = await this.client
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: message.from.email,
                                Name: message.from.name
                            },
                            To: [
                                {
                                    Email: message.to,
                                    Name: message.to.split('@')[0] // Use email username as name if not provided
                                }
                            ],
                            Subject: message.subject,
                            TextPart: message.text,
                            HTMLPart: message.html
                        }
                    ]
                });

            console.log(`[Mailjet] Email sent successfully to ${message.to}`);
            console.log(`[Mailjet] Response:`, JSON.stringify(request.body, null, 2));
        } catch (error: any) {
            console.error('[Mailjet] Email sending failed:', error);
            if (error.statusCode) {
                console.error('[Mailjet] Status:', error.statusCode);
            }
            console.error('[Mailjet] Error message:', error.message || error);
            throw error;
        }
    }
}
