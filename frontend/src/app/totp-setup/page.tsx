'use client';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    Security,
    Smartphone,
    CheckCircle,
    QrCode2,
    Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, Suspense } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

function TOTPSetupContent() {
    const router = useRouter();
    const muiTheme = useTheme();
    const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Mode from localStorage - rescan/reset from dashboard
    const [mode, setMode] = useState<'first' | 'rescan' | 'reset'>('first');

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
        const totpMode = localStorage.getItem('totp_mode');
        if (totpMode === 'rescan') {
            setMode('rescan');
        } else if (totpMode === 'reset') {
            setMode('reset');
        } else {
            setMode('first');
        }
    }, []);

    const mockSecretKey = 'JBSWY3DPEHPK3PXP';

    // Only show close if coming from dashboard (rescan or reset mode)
    const showClose = mode === 'rescan' || mode === 'reset';

    const handleClose = () => {
        localStorage.removeItem('totp_mode');
        router.push('/dashboard');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsVerifying(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (code === '123456' || code.length === 6) {
            localStorage.setItem('totp_enabled', 'true');
            localStorage.removeItem('totp_mode');
            setStep('success');
            setTimeout(() => {
                if (mode === 'first') {
                    router.push('/setup-link');
                } else {
                    router.push('/dashboard');
                }
            }, 2000);
        } else {
            setError('Invalid code. Please try again.');
        }

        setIsVerifying(false);
    };

    const isComplete = otp.every(digit => digit !== '');

    useEffect(() => {
        if (isComplete && step === 'verify') {
            handleVerify();
        }
    }, [isComplete]);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            p: 2,
        }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <ThemeToggle />
                {showClose && (
                    <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
                        <Close />
                    </IconButton>
                )}
            </Box>

            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
                <AnimatePresence mode="wait">
                    {step === 'qr' && (
                        <MotionPaper
                            key="qr-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 5 },
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                            }}
                        >
                            <MotionBox
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Box sx={{
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}>
                                    <Security sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                                </Box>
                            </MotionBox>

                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
                                {mode === 'rescan' ? 'Add to Another Device' : mode === 'reset' ? 'Reset TOTP' : 'Setup Two-Factor Auth'}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                {mode === 'rescan'
                                    ? 'Scan with your new authenticator app'
                                    : 'Scan with Google Authenticator, Authy, etc.'
                                }
                            </Typography>

                            <MotionBox
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                sx={{
                                    width: { xs: 160, sm: 200 },
                                    height: { xs: 160, sm: 200 },
                                    mx: 'auto',
                                    mb: 3,
                                    bgcolor: 'white',
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid',
                                    borderColor: 'divider',
                                    p: 2,
                                }}
                            >
                                <QrCode2 sx={{ fontSize: { xs: 120, sm: 160 }, color: 'text.primary' }} />
                            </MotionBox>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Or enter manually:
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight="600"
                                sx={{
                                    fontFamily: 'monospace',
                                    bgcolor: 'action.hover',
                                    p: 1.5,
                                    borderRadius: 2,
                                    mb: 3,
                                    letterSpacing: 1,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                }}
                            >
                                {mockSecretKey}
                            </Typography>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={() => setStep('verify')}
                                    startIcon={<Smartphone />}
                                    sx={{ py: 1.5 }}
                                >
                                    I&apos;ve scanned the code
                                </Button>
                            </motion.div>
                        </MotionPaper>
                    )}

                    {step === 'verify' && (
                        <MotionPaper
                            key="verify-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 5 },
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <AnimatePresence>
                                {isVerifying && (
                                    <MotionBox
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            gap: 2,
                                            zIndex: 10,
                                            bgcolor: 'background.paper',
                                            opacity: 0.97,
                                        }}
                                    >
                                        <SquircleLoader size={50} color={loaderColor} />
                                        <Typography color="text.secondary">Verifying...</Typography>
                                    </MotionBox>
                                )}
                            </AnimatePresence>

                            <MotionBox
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Box sx={{
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    bgcolor: 'secondary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}>
                                    <Smartphone sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                                </Box>
                            </MotionBox>

                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
                                Enter Code
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Enter the 6-digit code from your app
                            </Typography>

                            <Box
                                sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', mb: 2 }}
                                onPaste={handlePaste}
                            >
                                {otp.map((digit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                    >
                                        <TextField
                                            inputRef={(el) => (inputRefs.current[index] = el)}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            inputProps={{
                                                maxLength: 1,
                                                style: {
                                                    textAlign: 'center',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 600,
                                                },
                                            }}
                                            sx={{
                                                width: { xs: 42, sm: 50 },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: 'background.paper',
                                                },
                                            }}
                                            error={!!error}
                                        />
                                    </motion.div>
                                ))}
                            </Box>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Typography color="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
                                            {error}
                                        </Typography>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleVerify}
                                    disabled={!isComplete || isVerifying}
                                    sx={{ py: 1.5, mt: 1 }}
                                >
                                    Verify
                                </Button>
                            </motion.div>

                            <Button
                                variant="text"
                                size="small"
                                onClick={() => setStep('qr')}
                                sx={{ mt: 2 }}
                                disabled={isVerifying}
                            >
                                Back to QR code
                            </Button>
                        </MotionPaper>
                    )}

                    {step === 'success' && (
                        <MotionPaper
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 5 },
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                            }}
                        >
                            <MotionBox
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Box sx={{
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}>
                                    <CheckCircle sx={{ fontSize: { xs: 48, sm: 60 }, color: 'white' }} />
                                </Box>
                            </MotionBox>

                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                                All Set!
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                Two-factor authentication is enabled.
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <SquircleLoader size={24} color={loaderColor} />
                                <Typography variant="body2" color="text.secondary">
                                    Redirecting...
                                </Typography>
                            </Box>
                        </MotionPaper>
                    )}
                </AnimatePresence>
            </Container>
        </Box>
    );
}

export default function TOTPSetupPage() {
    const muiTheme = useTheme();
    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    return (
        <Suspense fallback={
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        }>
            <TOTPSetupContent />
        </Suspense>
    );
}
