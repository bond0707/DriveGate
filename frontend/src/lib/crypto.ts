import * as OTPAuth from 'otpauth';

export interface TotpResult {
    code: string;
    progress: number; // 0-100, percentage of time remaining
}

/**
 * Generate a TOTP code and calculate remaining time progress.
 * Uses SHA1, 6 digits, 30-second period (standard TOTP).
 */
export function generateTotp(secret: string, email: string): TotpResult {
    const totp = new OTPAuth.TOTP({
        issuer: 'DriveGate',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
    });

    const code = totp.generate();
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = 30 - (now % 30);
    const progress = remainingSeconds * (100 / 30);

    return { code, progress };
}
