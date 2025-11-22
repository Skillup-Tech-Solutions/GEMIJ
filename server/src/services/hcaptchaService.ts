import axios from 'axios';

interface HCaptchaVerifyResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    'error-codes'?: string[];
}

export class HCaptchaService {
    private static verifyUrl = 'https://hcaptcha.com/siteverify';

    static async verifyToken(token: string, ip?: string): Promise<boolean> {
        // Allow bypass for testing only from localhost
        if (token === 'mock-captcha-token') {
            const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
            if (isLocalhost) {
                return true;
            }
        }

        const secretKey = process.env.HCAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.error('HCAPTCHA_SECRET_KEY is not defined in environment variables');
            // In development, we might want to allow bypass if key is missing, 
            // but for security it's better to fail closed or log a warning.
            // For now, let's fail closed to ensure proper configuration.
            return false;
        }

        try {
            const params = new URLSearchParams();
            params.append('secret', secretKey);
            params.append('response', token);

            const response = await axios.post<HCaptchaVerifyResponse>(
                this.verifyUrl,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const { success } = response.data;

            if (!success) {
                console.warn('hCaptcha verification failed:', response.data['error-codes']);
            }

            return success;
        } catch (error) {
            console.error('Error verifying hCaptcha token:', error);
            return false;
        }
    }
}
