import { LogIn, QrCode, Upload, Link as LinkIcon, FolderPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TutorialStep {
    step: number;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    example?: string;
}

export const tutorialSteps: TutorialStep[] = [
    {
        step: 1,
        title: 'Sign in with Google',
        description: 'Click "Sign in with Google" and allow DriveGate to access your account. We only request minimal permissions.',
        icon: LogIn,
        color: '#4285F4',
    },
    {
        step: 2,
        title: 'Set up your authenticator',
        description: 'Scan the QR code with Google Authenticator, Authy, or any TOTP app. This generates time-based codes for secure uploads.',
        icon: QrCode,
        color: '#00897B',
    },
    {
        step: 3,
        title: 'Choose your URL',
        description: 'Pick a custom URL slug for your upload page.',
        example: 'drivegate.app/my-uploads',
        icon: LinkIcon,
        color: '#5C6BC0',
    },
    {
        step: 4,
        title: 'Create your folder',
        description: 'Name the folder in your Google Drive where uploaded files will be stored.',
        icon: FolderPlus,
        color: '#F59E0B',
    },
    {
        step: 5,
        title: 'Upload from anywhere',
        description: 'Visit your custom URL on any device, enter your 6-digit code, and drop files. No login required!',
        icon: Upload,
        color: '#10B981',
    },
];
