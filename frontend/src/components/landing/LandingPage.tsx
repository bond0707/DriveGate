'use client';
import { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, Button, useColorScheme } from '@mui/material';
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
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
import type { TutorialSectionHandle } from './sections';

export default function LandingPage() {
    const { mode } = useColorScheme();
    const [scrolled, setScrolled] = useState(false);
    const [heroButtonVisible, setHeroButtonVisible] = useState(true);
    const [firstToggleVisible, setFirstToggleVisible] = useState(true);
    const [secondToggleVisible, setSecondToggleVisible] = useState(false);
    const tutorialRef = useRef<TutorialSectionHandle>(null);

    useMotionValueEvent(useScroll().scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    // Handle toggle visibility with delays for smooth transitions
    useEffect(() => {
        if (heroButtonVisible) {
            // Scrolling up: hide second toggle immediately, show first after delay
            setSecondToggleVisible(false);
            const timer = setTimeout(() => {
                setFirstToggleVisible(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            // Scrolling down: hide first toggle immediately, show second after delay
            setFirstToggleVisible(false);
            const timer = setTimeout(() => {
                setSecondToggleVisible(true);
            }, 50); // Small delay to let first toggle disappear
            return () => clearTimeout(timer);
        }
    }, [heroButtonVisible]);

    const handleHowItWorksClick = () => {
        // Reset tutorial to first step
        tutorialRef.current?.resetStep();

        // Scroll to tutorial section with offset to center content
        const tutorialElement = document.getElementById('tutorial');
        if (tutorialElement) {
            const elementRect = tutorialElement.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const offset = window.innerHeight * 0.15; // 15% from top for better centering with title visible
            window.scrollTo({
                top: absoluteElementTop - offset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative background gradients */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '5%',
                    left: '-15%',
                    width: '50%',
                    height: '50%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 137, 123, 0.12) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'fixed',
                    bottom: '10%',
                    right: '-10%',
                    width: '45%',
                    height: '45%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(92, 107, 192, 0.10) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

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
                        md: 'blur(12px)'
                    },
                    bgcolor: {
                        xs: 'transparent',
                        md: scrolled
                            ? 'rgba(var(--mui-palette-background-defaultChannel) / 0.8)'
                            : 'rgba(var(--mui-palette-background-defaultChannel) / 0.4)'
                    },
                    borderBottom: 0,
                    // Gradient mask for smooth blur edge
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: -20,
                        height: 20,
                        background: 'linear-gradient(to bottom, rgba(var(--mui-palette-background-defaultChannel) / 0.4), transparent)',
                        pointerEvents: 'none',
                        display: { xs: 'none', md: 'block' },
                    },
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
                            {/* Theme toggle visible when hero button is visible (with delay on reappear) */}
                            {firstToggleVisible && <ThemeToggle />}

                            {/* Get Started + Theme toggle that slide in together (with delay) */}
                            <AnimatePresence>
                                {secondToggleVisible && (
                                    <motion.div
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 100, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                                    >
                                        <ThemeToggle />
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <main>
                <HeroSection onVisibilityChange={setHeroButtonVisible} onHowItWorksClick={handleHowItWorksClick} />
                <ProblemSolutionSection />
                <FeaturesSection />
                <TutorialSection ref={tutorialRef} />
                <TrustSection />
                <FAQSection />
            </main>

            <FooterSection />
        </Box>
    );
}
