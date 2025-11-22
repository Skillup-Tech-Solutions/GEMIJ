import React, { useRef, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaComponentProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
}

const HCaptchaComponent: React.FC<HCaptchaComponentProps> = ({
    onVerify,
    onError,
    onExpire
}) => {
    const captchaRef = useRef<HCaptcha>(null);
    const sitekey = import.meta.env.VITE_HCAPTCHA_SITEKEY;

    const handleVerify = useCallback((token: string) => {
        onVerify(token);
    }, [onVerify]);

    const handleError = useCallback(() => {
        if (onError) {
            onError();
        }
    }, [onError]);

    const handleExpire = useCallback(() => {
        if (onExpire) {
            onExpire();
        }
    }, [onExpire]);

    if (!sitekey) {
        console.error('hCaptcha sitekey is not configured');
        return null;
    }

    return (
        <div className="flex justify-center my-4">
            <HCaptcha
                ref={captchaRef}
                sitekey={sitekey}
                onVerify={handleVerify}
                onError={handleError}
                onExpire={handleExpire}
            />
        </div>
    );
};

export default HCaptchaComponent;
