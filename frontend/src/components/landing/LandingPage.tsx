'use client';
import { useState } from 'react';
import { Box, Container, Typography, Button, useColorScheme } from '@mui/material';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import ThemeToggle from '../ThemeToggle';
import {
    HeroSection,
    ProblemSolutionSection,
    FeaturesSection,
    TutorialSection,
    TrustSection,
    FAQSection,
    FooterSection,
} from './sections';

export default function LandingPage() {
    const { mode } = useColorScheme();
    const [scrolled, setScrolled] = useState(false);
    const [heroButtonVisible, setHeroButtonVisible] = useState(true);

    useMotionValueEvent(useScroll().scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header - scrolls away on mobile, fixed on desktop */}
            <Box
                component="header"
                sx={{
                    position: { xs: 'absolute', md: 'fixed' },
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    py: 2,
                    px: { xs: 2, md: 4 },
                    transition: 'all 0.3s ease',
                    backdropFilter: {
                        xs: 'none',
                        md: scrolled ? 'blur(12px)' : 'none'
                    },
                    bgcolor: {
                        xs: 'transparent',
                        md: scrolled
                            ? 'rgba(var(--mui-palette-background-defaultChannel) / 0.8)'
                            : 'transparent'
                    },
                    borderBottom: 0,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Image
                                src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                                alt="DriveGate"
                                width={32}
                                height={32}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                DriveGate
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ThemeToggle />
                            {/* Show Get Started only when Start Uploading is NOT visible */}
                            {!heroButtonVisible && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    href="/login"
                                    sx={{
                                        color: '#ffffff',
                                        background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #00796B 0%, #004D40 100%)',
                                        },
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        px: { xs: 1.5, sm: 2 },
                                        py: { xs: 0.5, sm: 0.75 },
                                    }}
                                >
                                    Get Started
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <main>
                <HeroSection onVisibilityChange={setHeroButtonVisible} />
                <ProblemSolutionSection />
                <FeaturesSection />
                <TutorialSection />
                <TrustSection />
                <FAQSection />
            </main>

            <FooterSection />
        </Box>
    );
}
