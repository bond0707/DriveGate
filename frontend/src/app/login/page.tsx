import type { Metadata } from 'next';
import LoginClient from './Login.client';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to DriveGate to manage your secure file upload links. Create custom URLs for TOTP-protected uploads to your Google Drive.',
  openGraph: {
    title: 'Sign In',
    description: 'Sign in to manage your secure file upload links.',
    type: 'website',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
