'use client';
import { useState, forwardRef, useImperativeHandle, useEffect, useRef, useMemo } from 'react';
import { Box, Container, Typography, Paper, Tooltip } from '@mui/material';
import { Smartphone } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';
import { tutorialSteps } from './tutorialData';
import Carousel, { CarouselItem } from '@/components/Carousel';

export interface TutorialSectionHandle {
    resetStep: () => void;
}

const TutorialSection = forwardRef<TutorialSectionHandle>((_, ref) => {
    const [resetKey, setResetKey] = useState(0);
    const [carouselWidth, setCarouselWidth] = useState(300);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        resetStep: () => setResetKey((k) => k + 1),
    }));

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setCarouselWidth(Math.min(entry.contentRect.width, 500));
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const carouselItems = useMemo<CarouselItem[]>(() => {
        return tutorialSteps.map((step) => {
            const IconComponent = step.icon;
            const desc = step.example ? (
                <span>
                    {step.description}
                    <br />
                    Example: {step.example}
                </span>
            ) : (
                <span>{step.description}</span>
            );

            return {
                id: step.step,
                title: step.title,
                description: desc,
                icon: <IconComponent className="carousel-icon" />,
                color: step.color
            };
        });
    }, []);

    return (
        <Box
            id="tutorial"
            component="section"
            sx={{
                py: { xs: 10, md: 16 },
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="lg">
                <AnimatedSection>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            letterSpacing: 2,
                            display: 'block',
                            textAlign: 'center',
                            mb: 2,
                        }}
                    >
                        How It Works
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            mb: 2,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                    >
                        Get started in 5 simple steps.
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            textAlign: 'center',
                            mb: 4,
                            maxWidth: 600,
                            mx: 'auto',
                        }}
                    >
                        One-time setup takes just a few minutes. After that, upload from any device instantly.
                    </Typography>
                </AnimatedSection>

                {/* Prerequisites and TOTP Info */}
                <AnimatedSection delay={0.1}>
                    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                        {/* Before You Start */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: 'rgba(0, 137, 123, 0.08)',
                                border: '1px solid',
                                borderColor: 'rgba(0, 137, 123, 0.2)',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Smartphone size={18} color="#00897B" />
                                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                    Before You Start
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                Download a{' '}
                                <Tooltip
                                    title={
                                        <Box sx={{ p: 0.5 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                Time-based One-Time Password
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                                The same technology banks use for 2FA. Codes change every 30 seconds.
                                            </Typography>
                                        </Box>
                                    }
                                    arrow
                                    placement="top"
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            cursor: 'help',
                                            borderBottom: '1px dashed',
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        TOTP authenticator app
                                    </Box>
                                </Tooltip>
                                {' '}on your phone:{' '}
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>2FAS</Box>,{' '}
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Google Authenticator</Box>,{' '}
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Authy</Box>, or{' '}
                                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Microsoft Authenticator</Box>.
                            </Typography>
                        </Paper>
                    </Box>
                </AnimatedSection>

                {/* Carousel */}
                <AnimatedSection delay={0.2}>
                    <Box
                        ref={containerRef}
                        sx={{
                            maxWidth: 500,
                            mx: 'auto',
                            minHeight: { xs: 450, md: 400 },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {carouselWidth > 0 && (
                            <Carousel
                                key={resetKey}
                                items={carouselItems}
                                baseWidth={carouselWidth}
                                autoplay
                                autoplayDelay={3000}
                                pauseOnHover
                                loop={true}
                                round={false}
                            />
                        )}
                    </Box>
                </AnimatedSection>
            </Container>
        </Box>
    );
});

TutorialSection.displayName = 'TutorialSection';

export default TutorialSection;
