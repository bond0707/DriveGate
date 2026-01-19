'use client';
import { Box, Button, Typography, Paper, useColorScheme } from '@mui/material';
import { CloudUploadRounded, Google, HistoryEduRounded, SecurityRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/lib/api';
import Image from 'next/image';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

export default function LoginClient() {
    const { mode } = useColorScheme();

    const handleGoogleSignIn = async () => {
        try {
            const response = await api.get('/auth/google/login');
            window.location.href = response.data.auth_url;
        } catch (error) {
            console.error('Failed to get login URL:', error);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            bgcolor: 'background.default',
            position: 'relative',
        }}>
            {/* Theme Toggle - Top Right */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
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

            {/* Right Side - Sign In */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    bgcolor: 'background.default',
                }}
            >
                <MotionPaper
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    elevation={0}
                    sx={{
                        p: 5,
                        maxWidth: 450,
                        width: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {/* Mobile logo */}
                    <Box sx={{
                        display: { xs: 'flex', md: 'none' },
                        justifyContent: 'flex-start',
                        mb: 4,
                        gap: 2,
                        alignItems: 'center'
                    }}>
                        <Image src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="DriveGate" width={40} height={40} />
                        <Typography variant="h4" fontWeight="700" color="primary">
                            DriveGate
                        </Typography>
                    </Box>

                    <Typography variant="h4" fontWeight="700" gutterBottom sx={{ pl: 1 }}>
                        Welcome
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, pl: 1 }}>
                        Sign in to manage your cloud upload links
                    </Typography>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<Google />}
                            onClick={handleGoogleSignIn}
                            sx={{ py: 1.5, fontSize: '1rem' }}
                        >
                            Sign in with Google
                        </Button>
                    </motion.div>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 4, textAlign: 'center' }}
                    >
                        New here? Your account will be created automatically.
                    </Typography>
                </MotionPaper>
            </Box>
        </Box>
    );
}
