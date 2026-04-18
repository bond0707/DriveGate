import type { Metadata } from 'next';
import { Suspense } from 'react';
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
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
