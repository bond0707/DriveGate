'use client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import { useTheme } from '@mui/material/styles';
import Security from '@mui/icons-material/Security';
import Smartphone from '@mui/icons-material/Smartphone';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Close from '@mui/icons-material/Close';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, Suspense } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import StyledQRCode from '@/components/StyledQRCode';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

function TOTPSetupContent() {
    const router = useRouter();
    const muiTheme = useTheme();
    const { checkAuth } = useAuth();

    // UI State
    const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // API Data State
    const [isLoading, setIsLoading] = useState(true);
    const [secret, setSecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');

    // Mode State (first time vs rescan/reset from dashboard)
    const [mode, setMode] = useState<'first' | 'rescan' | 'reset'>('first');

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // 1. Initialize Mode and Fetch TOTP Secret based on mode
    useEffect(() => {
        const totpMode = localStorage.getItem('totp_mode');
        let currentMode: 'first' | 'rescan' | 'reset' = 'first';

        if (totpMode === 'rescan') {
            currentMode = 'rescan';
        } else if (totpMode === 'reset') {
            currentMode = 'reset';
        }
        setMode(currentMode);

        const fetchSetup = async () => {
            try {
                // For rescan mode, fetch existing TOTP secret from backend
                // For reset or first-time setup, generate a new secret
                const endpoint = currentMode === 'rescan' ? '/totp/secret/current' : '/totp/secret';
                const response = await api.get(endpoint);

                setSecret(response.data.totp_secret);
                setProvisioningUri(response.data.provisioning_uri);
            } catch (err: unknown) {
                console.error('Failed to fetch TOTP setup:', err);
                const axiosErr = err as { response?: { status?: number } };
                // If rescan fails (e.g., no existing secret), show helpful message
                if (currentMode === 'rescan' && axiosErr.response?.status === 404) {
                    setError('No existing TOTP found. Please set up a new one.');
                } else {
                    setError('Failed to load TOTP. Please refresh.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSetup();
    }, []);

    // Update page title based on mode
    useEffect(() => {
        if (mode === 'rescan') {
            document.title = 'Rescan TOTP | DriveGate';
        } else if (mode === 'reset') {
            document.title = 'Reset TOTP | DriveGate';
        } else {
            document.title = 'Setup TOTP | DriveGate';
        }
    }, [mode]);

    // 3. Handle Browser Back Button (Cleanup)
    useEffect(() => {
        const handlePopState = () => {
            localStorage.removeItem('totp_mode');
            if (mode === 'reset') {
                // If they go back during reset, assume they want to keep the old one active
                localStorage.setItem('totp_enabled', 'true');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [mode]);

    // 4. Focus Logic
    useEffect(() => {
        if (step === 'verify') {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [step]);

    // Handlers
    const showClose = mode === 'rescan' || mode === 'reset';

    const handleClose = () => {
        localStorage.removeItem('totp_mode');
        // For reset mode, set flag to skip TOTP redirect since we're canceling
        if (mode === 'reset') {
            localStorage.setItem('skip_totp_setup', 'true');
            localStorage.setItem('totp_enabled', 'true');
        }
        router.push('/dashboard');
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(secret);
        setSnackbarOpen(true);
    };

    const handleOtpChange = (index: number, value: string) => {
        // Handle multi-character paste on mobile (onChange fires with all chars)
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6);
            if (digits.length > 1) {
                const newOtp = [...otp];
                digits.split('').forEach((char, i) => {
                    if (i < 6) newOtp[i] = char;
                });
                setOtp(newOtp);
                setError('');
                const focusIndex = Math.min(digits.length, 5);
                inputRefs.current[focusIndex]?.focus();
                return;
            }
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) return;

        // Only allow input if all previous boxes are filled
        if (value && index > 0) {
            const allPreviousFilled = otp.slice(0, index).every(d => d !== '');
            if (!allPreviousFilled) return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
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
        setError('');

        try {
            await api.post('/totp/secret', {
                user_totp: code,
                user_totp_secret: secret,
            });

            // Update local state and auth context
            localStorage.setItem('totp_enabled', 'true');
            localStorage.removeItem('totp_mode');
            await checkAuth();

            setStep('success');

            // Intelligent Redirect
            setTimeout(() => {
                if (mode === 'first') {
                    router.push('/setup-link');
                } else {
                    router.push('/dashboard');
                }
            }, 2000);

        } catch (err: unknown) {
            console.error('Verification failed:', err);
            const axiosErr = err as { response?: { data?: { detail?: unknown } } };
            const detail = axiosErr.response?.data?.detail;
            const errorMessage = typeof detail === 'string'
                ? detail
                : 'Invalid code. Please try again.';
            setError(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    // Auto-submit when 6 digits are filled
    useEffect(() => {
        if (isComplete && step === 'verify') {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isComplete]);

    if (isLoading || (!error && (!secret || !provisioningUri))) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

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
                    {/* STEP 1: QR CODE */}
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
                                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                            >
                                <Box sx={{
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    bgcolor: '#00897B',
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
                                    width: 'fit-content',
                                    mx: 'auto',
                                    mb: 3,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {provisioningUri ? (
                                    <StyledQRCode value={provisioningUri} size={200} logoSize={45} />
                                ) : null}
                            </MotionBox>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Or enter manually:
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                mb: 3,
                                bgcolor: 'action.hover',
                                pl: 2,
                                pt: 2,
                                pb: 2,
                                pr: 1,
                                borderRadius: 2,
                                width: 'fit-content',
                                mx: 'auto'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    gap: { xs: 0.25, sm: 0 },
                                }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        sx={{
                                            fontFamily: 'monospace',
                                            letterSpacing: 1,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        }}
                                    >
                                        {secret.slice(0, 16)}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        sx={{
                                            fontFamily: 'monospace',
                                            letterSpacing: 1,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        }}
                                    >
                                        {secret.slice(16)}
                                    </Typography>
                                </Box>
                                <Tooltip title="Copy Secret">
                                    <IconButton size="small" onClick={handleCopyToClipboard}>
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

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

                    {/* STEP 2: VERIFY */}
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
                                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                            >
                                <Box sx={{
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    bgcolor: '#EC4899',
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
                                            disabled={index > 0 && otp.slice(0, index).some(d => d === '')}
                                            inputProps={{
                                                maxLength: 6,
                                                style: {
                                                    textAlign: 'center',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 600,
                                                },
                                                onPaste: handlePaste,
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
                                {error ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Typography color="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
                                            {error}
                                        </Typography>
                                    </motion.div>
                                ) : null}
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

                    {/* STEP 3: SUCCESS */}
                    {step === 'success' && (
                        <MotionPaper
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
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
                                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
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

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message="Secret copied to clipboard"
            />
        </Box>
    );
}

export default function SetupTOTPClient() {
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