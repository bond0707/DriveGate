'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, Button, Alert, useTheme } from '@mui/material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import SquircleLoader from '@/components/SquircleLoader';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useTheme();
    const { login } = useAuth();
    const processedRef = useRef(false);
    const [error, setError] = useState('');

    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
        const handleCallback = async () => {
            if (processedRef.current) return;
            processedRef.current = true;

            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code) {
                console.error('No code found in params');
                router.push('/login');
                return;
            }

            try {
                const response = await api.post('/auth/google/callback', {
                    code,
                    state
                });

                const { access_token, user } = response.data;
                login(access_token, user);
            } catch (err: unknown) {
                console.error('Login failed:', err);
                const axiosErr = err as { response?: { data?: { detail?: string } } };
                const msg = axiosErr.response?.data?.detail || 'Authentication failed. Please try again.';
                setError(msg);
            }
        };

        handleCallback();
    }, [searchParams, router, login]);

    if (error) {
        return (
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                p: 3,
                bgcolor: 'background.default'
            }}>
                <Alert severity="error" variant="filled" sx={{ width: '100%', maxWidth: 400 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => router.push('/login')}>
                    Back to Login
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            bgcolor: 'background.default'
        }}>
            <SquircleLoader size={50} color={loaderColor} />
            <Typography color="text.secondary">Completing sign in...</Typography>
        </Box>
    );
}

function AuthCallbackFallback() {
    const theme = useTheme();
    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            bgcolor: 'background.default'
        }}>
            <SquircleLoader size={50} color={loaderColor} />
            <Typography color="text.secondary">Loading...</Typography>
        </Box>
    );
}

export default function AuthCallbackClient() {
    return (
        <Suspense fallback={<AuthCallbackFallback />}>
            <AuthCallbackContent />
        </Suspense>
    );
}
