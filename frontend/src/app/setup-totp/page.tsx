import type { Metadata } from 'next';
import SetupTOTPClient from './SetupTOTP.client';

export const metadata: Metadata = {
    title: 'Setup TOTP | DriveGate',
    description: 'Set up two-factor authentication to secure your DriveGate uploads.',
};

export default function SetupTOTPPage() {
    return <SetupTOTPClient />;
}