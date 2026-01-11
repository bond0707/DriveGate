import type { Metadata } from 'next';
import HomeClient from './Home.client';

export const metadata: Metadata = {
  title: 'DriveGate - Secure File Uploads to Your Google Drive',
  description: 'Upload files to your Google Drive without logging in using TOTP authentication. Zero-login guest uploads, permanent custom URLs, and secure write-only access.',
  openGraph: {
    title: 'DriveGate - Secure File Uploads to Your Google Drive',
    description: 'Upload files to your Google Drive without logging in using TOTP authentication. Zero-login guest uploads, permanent custom URLs, and secure write-only access.',
    type: 'website',
  },
  keywords: ['Google Drive', 'file upload', 'TOTP', 'secure upload', 'cloud storage', 'one-way upload'],
};

export default function Home() {
  return <HomeClient />;
}