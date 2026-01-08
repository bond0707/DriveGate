'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    TextField,
    CircularProgress,
    Snackbar,
    IconButton,
    Tooltip,
} from '@mui/material';
import { ContentCopy, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const MotionPaper = motion.create(Paper);

export default function TotpSetupPage() {
    const router = useRouter();
    const { user, checkAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [secret, setSecret] = useState('');
    const [provisioningUri, setProvisioningUri] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to array
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const fetchSetup = async () => {
            try {
                const response = await api.get('/totp/setup');
                setSecret(response.data.totp_secret);
                setProvisioningUri(response.data.provisioning_uri);
            } catch (err) {
                console.error('Failed to fetch TOTP setup:', err);
                setError('Failed to generate TOTP secret. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSetup();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(secret);
        setSuccessMessage('Secret copied to clipboard');
        setSnackbarOpen(true);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1); // Take last char if multiple
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto verify if full
        if (newOtp.every(d => d !== '') && index === 5 && value) {
            verifyTotp(newOtp.join(''));
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

        if (newOtp.every(d => d !== '')) {
            verifyTotp(newOtp.join(''));
        } else {
            // Focus the next empty box
            const nextEmpty = newOtp.findIndex(d => d === '');
            if (nextEmpty !== -1) {
                inputRefs.current[nextEmpty]?.focus();
            } else {
                inputRefs.current[5]?.focus();
            }
        }
    };

    const verifyTotp = async (code: string) => {
        setIsVerifying(true);
        setError('');

        try {
            await api.post('/totp/store', {
                user_totp: code,
                user_totp_secret: secret,
            });

            await checkAuth();
            setShowSuccess(true);
            setSuccessMessage('2FA Setup Successful!');
            setSnackbarOpen(true);

            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (error) {
            const err = error as any;
            console.error('Verification failed:', err);
            setError(err.response?.data?.detail || 'Verification failed. Please check the code and try again.');
            // Clear inputs on error so user can retry easily? Or keep them? 
            // Better to keep them so they can edit one digit if they made a mistake
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerify = () => {
        verifyTotp(otp.join(''));
    };

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="sm">
                <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
                    <ArrowBack />
                </IconButton>

                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}
                >
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Setup 2FA
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Scan the QR code below with your authenticator app
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, p: 2, bgcolor: 'white', borderRadius: 2, width: 'fit-content', mx: 'auto' }}>
                        {provisioningUri && (
                            <QRCodeSVG value={provisioningUri} size={200} />
                        )}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'action.hover',
                            p: 2,
                            borderRadius: 1,
                            justifyContent: 'center',
                            width: 'fit-content',
                            mx: 'auto'
                        }}>
                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {secret}
                            </Typography>
                            <Tooltip title="Copy Secret">
                                <IconButton size="small" onClick={handleCopy}>
                                    <ContentCopy fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom align="left" sx={{ width: '100%', mb: 1 }}>
                        Enter 6-digit code:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box
                            sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}
                            onPaste={handlePaste}
                        >
                            {otp.map((digit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                >
                                    <TextField
                                        inputRef={(el) => (inputRefs.current[index] = el)}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        disabled={isVerifying}
                                        error={!!error}
                                        inputProps={{
                                            maxLength: 1,
                                            style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, padding: '12px' },
                                        }}
                                        sx={{ width: { xs: 45, sm: 55 } }}
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
                                    <Typography color="error" variant="body2">{error}</Typography>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleVerify}
                            disabled={otp.some(d => d === '') || isVerifying}
                        >
                            {isVerifying ? <CircularProgress size={24} color="inherit" /> : 'Verify & Enable'}
                        </Button>
                    </Box>
                </MotionPaper>
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={successMessage}
            />
        </Box>
    );
}
