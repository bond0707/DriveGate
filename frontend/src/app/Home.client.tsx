'use client';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import LandingPage from '@/components/landing/LandingPage';

export default function HomeClient() {
    return (
        <SmoothScrollProvider>
            <Suspense fallback={
                <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                    <CircularProgress color="primary" />
                </Box>
            }>
                <LandingPage />
            </Suspense>
        </SmoothScrollProvider>
    );
}
