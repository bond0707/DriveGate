'use client';
import {
    Box,
    Container,
    IconButton,
    Snackbar,
    useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Extracted step components
import QrScannerStep from './QrScannerStep';
import VerifyOtpStep from './VerifyOtpStep';
import SuccessStep from './SuccessStep';

function TOTPSetupContent() {
    const router = useRouter();
    const muiTheme = useTheme();
    const { checkAuth } = useAuth();

    // UI State
    const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // API Data State
    const [isLoading, setIsLoading] = useState(true);
    const [secret, setSecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');

    // Mode State (first time vs rescan/reset from dashboard)
    const [mode, setMode] = useState<'first' | 'rescan' | 'reset'>('first');

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // 1. Initialize Mode and Fetch TOTP Secret
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
                const endpoint = currentMode === 'rescan' ? '/totp/secret/current' : '/totp/secret';
                const response = await api.get(endpoint);
                setSecret(response.data.totp_secret);
                setProvisioningUri(response.data.provisioning_uri);
            } catch (err: unknown) {
                console.error('Failed to fetch TOTP setup:', err);
                const axiosErr = err as { response?: { status?: number } };
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

    // 2. Update page title based on mode
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
                localStorage.setItem('totp_enabled', 'true');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [mode]);

    // Handlers
    const showClose = mode === 'rescan' || mode === 'reset';

    const handleClose = () => {
        localStorage.removeItem('totp_mode');
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
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6);
            if (digits.length > 1) {
                const newOtp = [...otp];
                digits.split('').forEach((char, i) => {
                    if (i < 6) newOtp[i] = char;
                });
                setOtp(newOtp);
                setError('');
                return;
            }
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) return;

        if (value && index > 0) {
            const allPreviousFilled = otp.slice(0, index).every(d => d !== '');
            if (!allPreviousFilled) return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // handled by input refs in VerifyOtpStep
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

            localStorage.setItem('totp_enabled', 'true');
            localStorage.removeItem('totp_mode');
            await checkAuth();

            setStep('success');

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
                    {step === 'qr' && (
                        <QrScannerStep
                            mode={mode}
                            secret={secret}
                            provisioningUri={provisioningUri}
                            onNext={() => setStep('verify')}
                            onCopySecret={handleCopyToClipboard}
                        />
                    )}

                    {step === 'verify' && (
                        <VerifyOtpStep
                            otp={otp}
                            error={error}
                            isVerifying={isVerifying}
                            loaderColor={loaderColor}
                            onOtpChange={handleOtpChange}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            onVerify={handleVerify}
                            onBack={() => setStep('qr')}
                        />
                    )}

                    {step === 'success' && (
                        <SuccessStep loaderColor={loaderColor} />
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