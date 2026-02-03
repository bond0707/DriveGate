'use client';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, useColorScheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CloudUploadRounded, Google, HistoryEduRounded, SecurityRounded, PersonAdd } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import SquircleLoader from '@/components/SquircleLoader';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

export default function LoginClient() {
    const { mode } = useColorScheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [newUserModalOpen, setNewUserModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Set loading to false once component is mounted
    useEffect(() => {
        setIsLoading(false);
    }, []);

    // Check if redirected from callback as a new user
    useEffect(() => {
        if (searchParams.get('new_user') === 'true') {
            setNewUserModalOpen(true);
            // Clean up the URL without refreshing
            router.replace('/login', { scroll: false });
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

    // Show loading state while hydrating - always dark background
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
            bgcolor: 'background.default',
            position: 'relative',
        }}>
            {/* Mobile Header - Logo + Theme Toggle */}
            <Box sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Image src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="DriveGate" width={36} height={36} />
                    <Typography variant="h5" fontWeight="700" color={mode === 'dark' ? "#FFFFFF" : "#000000"}>
                        DriveGate
                    </Typography>
                </Box>
                <ThemeToggle />
            </Box>

            {/* Desktop Theme Toggle */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
                <ThemeToggle />
            </Box>

            {/* Left Side - Branding */}
            <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #00897B 0%, #00695C 50%, #004D40 100%)',
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    p: 6,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '40%',
                        height: '40%',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        filter: 'blur(60px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '-15%',
                        right: '-15%',
                        width: '50%',
                        height: '50%',
                        borderRadius: '50%',
                        background: 'rgba(255, 138, 101, 0.15)',
                        filter: 'blur(80px)',
                    }}
                />

                {/* Content */}
                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 4,
                            justifyContent: 'center'
                        }}>
                            <Image src="/logo-light.svg" alt="DriveGate" width={60} height={60} />
                            <Typography variant="h3" fontWeight="700">
                                DriveGate
                            </Typography>
                        </Box>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                            The one-way entrance to your private cloud.
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Box sx={{ mt: 6 }}>
                            {[
                                { icon: <SecurityRounded />, text: 'Zero-Login Guest Uploads' },
                                { icon: <CloudUploadRounded />, text: 'Permanent Custom URLs' },
                                { icon: <HistoryEduRounded />, text: 'Secure Write-Only Access' }
                            ].map((feature, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    {feature.icon}
                                    <Typography variant="body1">{feature.text}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </motion.div>
                </Box>
            </MotionBox>

            {/* Right Side - Auth Cards */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3,
                    p: 4,
                    bgcolor: 'background.default',
                }}
            >
                {/* Sign In Card */}
                <MotionPaper
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    elevation={0}
                    sx={{
                        p: 4,
                        maxWidth: 450,
                        width: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >

                    <Typography variant="h5" fontWeight="700" gutterBottom sx={{ pl: 1 }}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, pl: 1 }}>
                        Sign in to manage your account
                    </Typography>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<Google />}
                            onClick={() => handleGoogleAuth(false)}
                            sx={{ py: 1.5, fontSize: '1rem' }}
                        >
                            Sign in with Google
                        </Button>
                    </motion.div>
                </MotionPaper>

                {/* Sign Up Card */}
                <MotionPaper
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    elevation={0}
                    sx={{
                        p: 4,
                        maxWidth: 450,
                        width: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" fontWeight="700" gutterBottom sx={{ pl: 1 }}>
                        New Here?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, pl: 1 }}>
                        Create your account and connect your Drive
                    </Typography>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<Google />}
                            onClick={() => handleGoogleAuth(true)}
                            sx={{ py: 1.5, fontSize: '1rem' }}
                        >
                            Sign up with Google
                        </Button>
                    </motion.div>
                </MotionPaper>
            </Box>

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
                    It seems you're new here...
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
