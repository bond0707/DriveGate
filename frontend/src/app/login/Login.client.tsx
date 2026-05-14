'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, useColorScheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Google, PersonAdd } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';


const MotionPaper = motion.create(Paper);

export default function LoginClient() {
    const { mode } = useColorScheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const isNewUser = searchParams.get('new_user') === 'true';
    const [newUserModalOpen, setNewUserModalOpen] = useState(isNewUser);

    // Clean up the URL once if redirected as new user
    useEffect(() => {
        if (isNewUser) {
            router.replace('/login', { scroll: false });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                <motion.div
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
                </motion.div>

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
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained" size="large" fullWidth
                            startIcon={<Google />}
                            onClick={() => handleGoogleAuth(false)}
                            sx={{ py: 1.5, fontSize: '0.95rem', borderRadius: 100 }}
                        >
                            Sign in with Google
                        </Button>
                    </motion.div>
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
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained" size="large" fullWidth
                            startIcon={<Google />}
                            onClick={() => handleGoogleAuth(true)}
                            sx={{ py: 1.5, fontSize: '0.95rem', borderRadius: 100 }}
                        >
                            Sign up with Google
                        </Button>
                    </motion.div>
                </MotionPaper>
            </MotionPaper>

            {/* New User Modal */}
            <Dialog
                open={newUserModalOpen}
                onClose={() => setNewUserModalOpen(false)}
                slotProps={{
                    backdrop: {
                        sx: {
                            backdropFilter: 'blur(4px)',
                        }
                    },
                    paper: {
                        sx: {
                            borderRadius: 3,
                            maxWidth: 420,
                            m: 2,
                            p: 1,
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: '#E8F5E9',
                        color: '#2E7D32',
                        display: 'flex'
                    }}>
                        <PersonAdd />
                    </Box>
                    It seems you&apos;re new here...
                </DialogTitle>
                <DialogContent sx={{ pb: 2, px: 3 }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        It looks like you don&apos;t have an account yet. To get started, you&apos;ll need to:
                    </Typography>
                    <Box component="ol" sx={{ pl: 2, m: 0, color: 'text.secondary' }}>
                        <li>Use the &quot;Sign up with Google&quot; button below</li>
                        <li>Grant DriveGate permission to access your Google Drive</li>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1, flexDirection: 'column', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Google />}
                        onClick={() => {
                            setNewUserModalOpen(false);
                            handleGoogleAuth(true);
                        }}
                        sx={{ py: 1.5 }}
                    >
                        Sign up with Google
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setNewUserModalOpen(false)}
                        sx={{ color: 'text.secondary', borderColor: 'divider' }}
                    >
                        I&apos;ll do it later
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

