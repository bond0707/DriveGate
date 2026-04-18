'use client';
import { Box, Container, Typography, Button } from '@mui/material';
import { m } from 'framer-motion';
import { MotionBox } from '@/components/motion';
import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';
import TextReveal from '../../TextReveal';
import { useSmoothScroll } from '../../SmoothScrollProvider';
import HeroVisual from './HeroVisual';


function generateRandomOTP(): string[] {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString());
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
                                <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
                                </m.div>
                                <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
                                </m.div>
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
