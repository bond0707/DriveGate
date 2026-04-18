import type { Metadata } from 'next';
import PublicUploadClient from './PublicUpload.client';

export const metadata: Metadata = {
    title: 'Secure Upload',
    description: `Securely upload files via DriveGate. TOTP-protected file transfer.`,
    robots: {
        index: false,
        follow: false,
    },
};

export default function PublicUploadPage() {
    return <PublicUploadClient />;
}