export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    variables: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BulkEmailRequest {
    templateId: string;
    recipientType: 'ALL_AUTHORS' | 'ALL_REVIEWERS' | 'ALL_USERS' | 'SPECIFIC' | 'CUSTOM';
    specificUserIds?: string[];
    customEmails?: string[];
    subjectOverride?: string;
}

export interface BulkEmailResponse {
    total: number;
    sent: number;
    failed: number;
}
