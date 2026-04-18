import type { Metadata } from 'next';
import TermsClient from './Terms.client';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Read the Terms of Service for DriveGate. Understand your rights and responsibilities when using our secure file upload service.',
    openGraph: {
        title: 'Terms of Service',
        description: 'Terms of Service for using DriveGate secure file upload service.',
        type: 'website',
    },
};

export default function TermsPage() {
    return <TermsClient />;
}
