'use client';
import { Typography, Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { MotionBox } from '@/components/motion';
import { useState, useEffect } from 'react';
import { Lock, CheckCircle } from 'lucide-react';



type VisualState = 'entering' | 'verifying' | 'verified';

interface HeroVisualProps {
    otpDigits: string[];
}

export default function HeroVisual({ otpDigits }: HeroVisualProps) {
    const [state, setState] = useState<VisualState>('entering');
    const [filledDigits, setFilledDigits] = useState(0);

    useEffect(() => {
        const runAnimation = () => {
            setState('entering');
            setFilledDigits(0);

            let digitIndex = 0;
            const digitInterval = setInterval(() => {
                digitIndex++;
                setFilledDigits(digitIndex);
                if (digitIndex >= 6) {
                    clearInterval(digitInterval);
                    setTimeout(() => setState('verifying'), 800);
                }
            }, 350);

            setTimeout(() => setState('verified'), 6000);
        };

        runAnimation();
        const loopInterval = setInterval(runAnimation, 18000);

        return () => clearInterval(loopInterval);
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <MotionBox
                animate={{
                    boxShadow: state === 'verified'
                        ? '0 0 60px rgba(0, 137, 123, 0.4)'
                        : '0 0 0px rgba(0, 137, 123, 0)',
                    borderColor: state === 'verified' ? '#00897B' : 'rgba(255,255,255,0.12)',
                }}
                transition={{ duration: 0.5 }}
                sx={{
                    width: { xs: 300, sm: 340, md: 380 },
                    height: { xs: 240, sm: 280, md: 380 },
                    borderRadius: { xs: 4, md: 6 },
                    background: 'linear-gradient(135deg, rgba(0, 137, 123, 0.1) 0%, rgba(92, 107, 192, 0.1) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 2, md: 3 },
                    p: { xs: 3, md: 4 },
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Lock/Check Icon */}
                <AnimatePresence mode="wait">
                    <MotionBox
                        key={state === 'verified' ? 'unlocked' : 'locked'}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        sx={{
                            width: { xs: 60, md: 80 },
                            height: { xs: 60, md: 80 },
                            borderRadius: { xs: 2, md: 3 },
                            background: state === 'verified'
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {state === 'verified' ? (
                            <CheckCircle size={32} color="white" />
                        ) : (
                            <Lock size={32} color="white" />
                        )}
                    </MotionBox>
                </AnimatePresence>

                {/* Title */}
                <AnimatePresence mode="wait">
                    <MotionBox
                        key={state}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Typography variant="body1" fontWeight={600} textAlign="center" sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }} color={
                            state === 'verified' ? 'success.main' : 'text.primary'
                        }>
                            {state === 'entering' && 'Enter Code'}
                            {state === 'verifying' && 'Verifying...'}
                            {state === 'verified' && 'Access Granted'}
                        </Typography>
                    </MotionBox>
                </AnimatePresence>

                {/* OTP Digits */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {otpDigits.map((digit, i) => (
                        <MotionBox
                            key={i}
                            animate={{
                                opacity: i < filledDigits || state === 'verified' ? 1 : 0.3,
                                backgroundColor: state === 'verified'
                                    ? '#10B981'
                                    : i < filledDigits
                                        ? '#00897B'
                                        : 'rgba(0,0,0,0)',
                            }}
                            transition={{
                                opacity: { duration: 0.8 },
                                backgroundColor: { duration: 0.4 },
                            }}
                            sx={{
                                width: { xs: 28, md: 36 },
                                height: { xs: 36, md: 44 },
                                borderRadius: 1.5,
                                bgcolor: i < filledDigits ? 'primary.main' : 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                color: i < filledDigits || state === 'verified' ? 'white' : 'text.disabled',
                            }}
                        >
                            {i < filledDigits || state === 'verified' ? digit : ''}
                        </MotionBox>
                    ))}
                </Box>
            </MotionBox>
        </Box>
    );
}
