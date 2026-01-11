import type { Metadata } from 'next';
import SetupLinkClient from './SetupLink.client';

export const metadata: Metadata = {
    title: 'Setup Upload Link | DriveGate',
    description: 'Create or update your custom URL for receiving files via DriveGate.',
};

export default function SetupLinkPage() {
    return <SetupLinkClient />;
}
