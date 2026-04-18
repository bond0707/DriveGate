'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, useColorScheme } from '@mui/material';
import { Google } from '@mui/icons-material';
import { m } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import SquircleLoader from '@/components/SquircleLoader';

import NewUserDialog from './NewUserDialog';
import { MotionPaper } from '@/components/motion';

export default function LoginClient() {
    const { mode } = useColorScheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [newUserModalOpen, setNewUserModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (searchParams.get('new_user') === 'true') {
            const timer = setTimeout(() => {
                setNewUserModalOpen(true);
                router.replace('/login', { scroll: false });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const handleGoogleAuth = async (forceConsent: boolean) => {
        try {
            const response = await api.get('/auth/google/login', {
                params: { force_consent: forceConsent }
            });
            window.location.href = response.data.auth_url;
        } catch (error) {
            console.error('Failed to get login URL:', error);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#121212',
            }}>
                <SquircleLoader size={50} color="#0D9488" />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
            position: 'relative',
            p: { xs: 2, md: 4 },
        }}>
            {/* Theme Toggle */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                <ThemeToggle />
            </Box>

            {/* Outer Wrapper Card */}
            <MotionPaper
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                elevation={0}
                sx={{
                    maxWidth: 480,
                    width: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    p: { xs: 3, sm: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                {/* Logo + Tagline */}
                <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ textAlign: 'center' }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
                        <Image
                            src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                            alt="DriveGate"
                            width={40}
                            height={40}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            DriveGate
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        The one-way entrance to your private cloud.
                    </Typography>
                </m.div>

                {/* Sign In Card */}
                <MotionPaper
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    elevation={0}
                    sx={{
                        p: 3,
                        width: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        Sign in to manage your account
                    </Typography>
                    <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained" size="large" fullWidth
                            startIcon={<Google />}
                            onClick={() => handleGoogleAuth(false)}
                            sx={{ py: 1.5, fontSize: '0.95rem', borderRadius: 100 }}
                        >
                            Sign in with Google
                        </Button>
                    </m.div>
                </MotionPaper>

                {/* Sign Up Card */}
                <MotionPaper
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    elevation={0}
                    sx={{
                        p: 3,
                        width: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        New Here?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        Create your account and connect your Drive
                    </Typography>
                    <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained" size="large" fullWidth
                            startIcon={<Google />}
                            onClick={() => handleGoogleAuth(true)}
                            sx={{ py: 1.5, fontSize: '0.95rem', borderRadius: 100 }}
                        >
                            Sign up with Google
                        </Button>
                    </m.div>
                </MotionPaper>
            </MotionPaper>

            {/* New User Modal */}
            <NewUserDialog
                open={newUserModalOpen}
                onClose={() => setNewUserModalOpen(false)}
                onSignUp={() => {
                    setNewUserModalOpen(false);
                    handleGoogleAuth(true);
                }}
            />
        </Box>
    );
}
