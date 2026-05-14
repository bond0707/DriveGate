'use client';
import dynamic from 'next/dynamic';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

// Dynamic import to avoid SSR issues with Lenis
const LandingPage = dynamic(() => import('@/components/landing/LandingPage'), {
    ssr: false,
});

export default function HomeClient() {
    return (
        <SmoothScrollProvider>
            <LandingPage />
        </SmoothScrollProvider>
    );
}
