import type { Metadata } from 'next';
import SetupFolderClient from './SetupFolder.client';

export const metadata: Metadata = {
    title: 'Setup Folder | DriveGate',
    description: 'Create or update the folder in your Google Drive where uploaded files will be stored.',
};

export default function SetupFolderPage() {
    return <SetupFolderClient />;
}
