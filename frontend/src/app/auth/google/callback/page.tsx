import type { Metadata } from 'next';
import AuthCallbackClient from './AuthCallback.client';

export const metadata: Metadata = {
    title: 'Signing In... | DriveGate',
    description: 'Completing your sign in to DriveGate.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AuthCallbackPage() {
    return <AuthCallbackClient />;
}
