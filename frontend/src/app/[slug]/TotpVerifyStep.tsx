'use client';
import { Box, Typography, TextField } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { m, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import SquircleLoader from '@/components/SquircleLoader';
import { MotionPaper, MotionBox } from '@/components/motion';

interface TotpVerifyStepProps {
    otp: string[];
    isVerifying: boolean;
    verifyError: string;
    rateLimitSeconds: number | null;
    loaderColor: string;
    onOtpChange: (index: number, value: string) => void;
    onKeyDown: (index: number, e: React.KeyboardEvent) => void;
    onPaste: (e: React.ClipboardEvent) => void;
}

export default function TotpVerifyStep({
    otp, isVerifying, verifyError, rateLimitSeconds, loaderColor,
    onOtpChange, onKeyDown, onPaste,
}: TotpVerifyStepProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, []);

    return (
        <MotionPaper
            key="totp-step"
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
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            bgcolor: 'background.paper',
                            opacity: 0.95,
                            gap: 2
                        }}
                    >
                        <SquircleLoader size={50} color={loaderColor} />
                        <Typography color="text.secondary">Verifying Code...</Typography>
                    </MotionBox>
                )}
            </AnimatePresence>

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
                <Lock sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom>
                Secure Upload
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Enter the 6-digit code provided by the owner.
            </Typography>

            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', mb: 3 }}>
                {otp.map((digit, index) => (
                    <m.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                    >
                        <TextField
                            inputRef={(el) => (inputRefs.current[index] = el)}
                            value={digit}
                            onChange={(e) => onOtpChange(index, e.target.value)}
                            onKeyDown={(e) => onKeyDown(index, e)}
                            disabled={isVerifying}
                            inputProps={{
                                maxLength: 6,
                                style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 600 },
                                onPaste: onPaste,
                            }}
                            sx={{
                                width: { xs: 42, sm: 50 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                },
                            }}
                            error={!!verifyError}
                        />
                    </m.div>
                ))}
            </Box>

            <AnimatePresence>
                {verifyError && (
                    <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Typography color="error" sx={{ mb: 2 }}>
                            {rateLimitSeconds !== null && rateLimitSeconds > 0
                                ? `Too many attempts. Try again in ${Math.floor(rateLimitSeconds / 60) > 0 ? `${Math.floor(rateLimitSeconds / 60)}m ` : ''}${rateLimitSeconds % 60}s`
                                : verifyError
                            }
                        </Typography>
                    </m.div>
                )}
            </AnimatePresence>
        </MotionPaper>
    );
}
