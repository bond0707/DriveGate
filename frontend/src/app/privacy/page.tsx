import type { Metadata } from 'next';
import PrivacyClient from './Privacy.client';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how DriveGate protects your privacy. We use minimal data collection, pass-through file uploads, and comply with Google API Services User Data Policy.',
    openGraph: {
        title: 'Privacy Policy',
        description: 'Learn how DriveGate protects your privacy and handles your data.',
        type: 'website',
    },
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}
