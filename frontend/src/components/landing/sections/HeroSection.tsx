'use client';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';
import TextReveal from '../../TextReveal';
import { useSmoothScroll } from '../../SmoothScrollProvider';

const MotionBox = motion.create(Box);

// Generate random 6-digit OTP
function generateRandomOTP(): string[] {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString());
}

// Animation states for the hero visual
type VisualState = 'entering' | 'verifying' | 'verified';

// Animated Hero Visual Component
function HeroVisual({ otpDigits }: { otpDigits: string[] }) {
    const [state, setState] = useState<VisualState>('entering');
    const [filledDigits, setFilledDigits] = useState(0);

    useEffect(() => {
        // Animation loop
        const runAnimation = () => {
            // Reset
            setState('entering');
            setFilledDigits(0);

            // Fill digits one by one (slower)
            let digitIndex = 0;
            const digitInterval = setInterval(() => {
                digitIndex++;
                setFilledDigits(digitIndex);
                if (digitIndex >= 6) {
                    clearInterval(digitInterval);
                    // Start verifying after all digits filled
                    setTimeout(() => setState('verifying'), 800);
                }
            }, 350);

            // Show verified after verifying (longer wait)
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
                }}
                transition={{ duration: 0.5 }}
                sx={{
                    width: { xs: 300, sm: 340, md: 380 },
                    height: { xs: 240, sm: 280, md: 380 },
                    borderRadius: { xs: 4, md: 6 },
                    background: 'linear-gradient(135deg, rgba(0, 137, 123, 0.1) 0%, rgba(92, 107, 192, 0.1) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid',
                    borderColor: state === 'verified' ? 'primary.main' : 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 2, md: 3 },
                    p: { xs: 3, md: 4 },
                    transition: 'border-color 0.3s ease',
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
                                        : undefined,
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

interface HeroSectionProps {
    onVisibilityChange: (visible: boolean) => void;
    onHowItWorksClick?: () => void;
}

export default function HeroSection({ onVisibilityChange, onHowItWorksClick }: HeroSectionProps) {
    const { scrollTo } = useSmoothScroll();

    // Generate random OTP on mount
    const otpDigits = useMemo(() => generateRandomOTP(), []);

    return (
        <Box
            component="section"
            sx={{
                minHeight: { xs: 'auto', md: '100vh' },
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                pt: { xs: 12, md: 0 },
                pb: { xs: 6, md: 0 },
            }}
        >

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: { xs: 4, md: 8 },
                        alignItems: 'center',
                    }}
                >
                    {/* Left side - Text */}
                    <Box>
                        <TextReveal
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                                fontWeight: 800,
                                lineHeight: 1.3,
                                mb: 3,
                                color: 'text.primary',
                            }}
                        >
                            The One-Way Entrance to Your Private Cloud.
                        </TextReveal>

                        <AnimatedSection delay={0.3} slideDirection="up">
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    mb: { xs: 3, md: 4 },
                                    maxWidth: 500,
                                    fontSize: { xs: '0.95rem', md: '1.125rem' },
                                    textAlign: { xs: 'justify', md: 'left' },
                                }}
                            >
                                Upload files to your Google Drive from any device using just a 6-digit code from your authenticator app. No login needed on untrusted devices.
                            </Typography>
                        </AnimatedSection>

                        <AnimatedSection delay={0.5} slideDirection="up">
                            <MotionBox
                                sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, justifyContent: { xs: 'center', md: 'flex-start' } }}
                                onViewportEnter={() => onVisibilityChange(true)}
                                onViewportLeave={() => onVisibilityChange(false)}
                                viewport={{ margin: '-100px' }}
                            >
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowRight size={18} />}
                                        href="/login"
                                        sx={{
                                            py: { xs: 1, md: 1.5 },
                                            px: { xs: 2, md: 4 },
                                            fontSize: { xs: '0.85rem', md: '1rem' },
                                            color: '#ffffff',
                                            background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #00796B 0%, #004D40 100%)',
                                            },
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Start Uploading
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={onHowItWorksClick || (() => scrollTo('#tutorial'))}
                                        sx={{
                                            py: { xs: 1, md: 1.5 },
                                            px: { xs: 2, md: 4 },
                                            fontSize: { xs: '0.85rem', md: '1rem' },
                                            borderWidth: 2,
                                            '&:hover': { borderWidth: 2 },
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        How It Works
                                    </Button>
                                </motion.div>
                            </MotionBox>
                        </AnimatedSection>
                    </Box>

                    {/* Right side - Animated Visual */}
                    <AnimatedSection delay={0.2} slideDirection="right">
                        <HeroVisual otpDigits={otpDigits} />
                    </AnimatedSection>
                </Box>
            </Container>
        </Box>
    );
}
