'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Button, Alert } from '@mui/material';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const processedRef = useRef(false);
    const [error, setError] = useState('');

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
            } catch (err: any) {
                console.error('Login failed:', err);
                const msg = err.response?.data?.detail || 'Authentication failed. Please try again.';
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
                p: 3
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
            gap: 3
        }}>
            <CircularProgress />
            <Typography>Completing sign in...</Typography>
        </Box>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3
            }}>
                <CircularProgress />
                <Typography>Loading...</Typography>
            </Box>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
