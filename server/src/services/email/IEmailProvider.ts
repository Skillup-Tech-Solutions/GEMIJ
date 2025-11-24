export interface EmailMessage {
    to: string;
    from: {
        email: string;
        name: string;
    };
    subject: string;
    html: string;
    text: string;
}

export interface IEmailProvider {
    /**
     * Send an email using this provider
     */
    sendEmail(message: EmailMessage): Promise<void>;

    /**
     * Check if this provider is properly configured
     */
    isConfigured(): boolean;

    /**
     * Get the name of this provider
     */
    getName(): string;
}
