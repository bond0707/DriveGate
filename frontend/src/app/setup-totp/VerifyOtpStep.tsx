'use client';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Smartphone } from '@mui/icons-material';
import { m, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import SquircleLoader from '@/components/SquircleLoader';
import { MotionPaper, MotionBox } from '@/components/motion';

interface VerifyOtpStepProps {
    otp: string[];
    error: string;
    isVerifying: boolean;
    loaderColor: string;
    onOtpChange: (index: number, value: string) => void;
    onKeyDown: (index: number, e: React.KeyboardEvent) => void;
    onPaste: (e: React.ClipboardEvent) => void;
    onVerify: () => void;
    onBack: () => void;
}

export default function VerifyOtpStep({
    otp, error, isVerifying, loaderColor,
    onOtpChange, onKeyDown, onPaste, onVerify, onBack,
}: VerifyOtpStepProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const isComplete = otp.every(d => d !== '');

    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, []);

    return (
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

            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', mb: 2 }}>
                {otp.map((digit, index) => (
                    <m.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <TextField
                            inputRef={(el) => (inputRefs.current[index] = el)}
                            value={digit}
                            onChange={(e) => onOtpChange(index, e.target.value)}
                            onKeyDown={(e) => onKeyDown(index, e)}
                            disabled={index > 0 && otp.slice(0, index).some(d => d === '')}
                            inputProps={{
                                maxLength: 6,
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                },
                                onPaste: onPaste,
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
                    </m.div>
                ))}
            </Box>

            <AnimatePresence>
                {error && (
                    <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Typography color="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
                            {error}
                        </Typography>
                    </m.div>
                )}
            </AnimatePresence>

            <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={onVerify}
                    disabled={!isComplete || isVerifying}
                    sx={{ py: 1.5, mt: 1 }}
                >
                    Verify
                </Button>
            </m.div>

            <Button
                variant="text"
                size="small"
                onClick={onBack}
                sx={{ mt: 2 }}
                disabled={isVerifying}
            >
                Back to QR code
            </Button>
        </MotionPaper>
    );
}
