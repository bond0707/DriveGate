'use client';

import { useState, useEffect } from 'react';
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
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
} from '@mui/material';
import { ContentCopy, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
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
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleVerify = async () => {
        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            await api.post('/totp/store', {
                user_totp: code,
                user_totp_secret: secret,
            });

            await checkAuth(); // Refresh user state to update UI
            setShowSuccess(true);
            setSuccessMessage('2FA Setup Successful!');
            setSnackbarOpen(true);

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (err: any) {
            console.error('Verification failed:', err);
            setError(err.response?.data?.detail || 'Verification failed. Please check the code and try again.');
        } finally {
            setIsVerifying(false);
        }
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
                    sx={{ p: 4, borderRadius: 2 }}
                >
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Setup 2FA
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, p: 2, bgcolor: 'white', borderRadius: 2, width: 'fit-content', mx: 'auto' }}>
                        {provisioningUri && (
                            <QRCodeSVG value={provisioningUri} size={200} />
                        )}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Or enter the code manually:
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'action.hover',
                            p: 2,
                            borderRadius: 1,
                            fontFamily: 'monospace'
                        }}>
                            <Typography sx={{ flex: 1, wordBreak: 'break-all', fontWeight: 'bold' }}>
                                {secret}
                            </Typography>
                            <Tooltip title="Copy Secret">
                                <IconButton size="small" onClick={handleCopy}>
                                    <ContentCopy fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Enter 6-digit code"
                            value={code}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setCode(val);
                                setError('');
                            }}
                            error={!!error || showSuccess}
                            helperText={error || (showSuccess && 'Success!')}
                            color={showSuccess ? 'success' : undefined}
                            fullWidth
                            autoComplete="off"
                            slotProps={{ htmlInput: { maxLength: 6, style: { fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' } } }}
                        />

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleVerify}
                            disabled={code.length !== 6 || isVerifying || showSuccess}
                        >
                            {isVerifying ? <CircularProgress size={24} /> : (showSuccess ? 'Setup Complete' : 'Verify & Enable')}
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
