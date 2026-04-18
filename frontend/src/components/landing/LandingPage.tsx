'use client';
import { useState, useRef, useEffect, startTransition } from 'react';
import { Container, Typography, Button, useColorScheme, Paper, Box } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { LinkOff } from '@mui/icons-material';
import Image from 'next/image';
import ThemeToggle from '../ThemeToggle';
import {
    HeroSection,
    WhatIsSection,
    ProblemSolutionSection,
    FeaturesSection,
    UseCasesSection,
    TutorialSection,
    TrustSection,
    FAQSection,
    FooterSection,
} from './sections';
import type { TutorialSectionHandle } from './sections';

export default function LandingPage() {
    const { mode } = useColorScheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [heroButtonVisible, setHeroButtonVisible] = useState(true);
    const [firstToggleVisible, setFirstToggleVisible] = useState(true);
    const [secondToggleVisible, setSecondToggleVisible] = useState(false);
    const [showInvalidLinkMessage, setShowInvalidLinkMessage] = useState(false);
    const tutorialRef = useRef<TutorialSectionHandle>(null);

    // Check for invalid_link query parameter
    useEffect(() => {
        if (searchParams.get('invalid_link') === 'true') {
            startTransition(() => {
                setShowInvalidLinkMessage(true);
            });
            router.replace('/', { scroll: false });
            const timer = setTimeout(() => setShowInvalidLinkMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle toggle visibility with delays for smooth transitions
    useEffect(() => {
        if (heroButtonVisible) {
            startTransition(() => {
                setSecondToggleVisible(false);
            });
            const timer = setTimeout(() => {
                setFirstToggleVisible(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            startTransition(() => {
                setFirstToggleVisible(false);
            });
            const timer = setTimeout(() => {
                setSecondToggleVisible(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [heroButtonVisible]);

    const handleHowItWorksClick = () => {
        tutorialRef.current?.resetStep();
        const tutorialElement = document.getElementById('tutorial');
        if (tutorialElement) {
            const elementRect = tutorialElement.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const offset = window.innerHeight * 0.15;
            window.scrollTo({
                top: absoluteElementTop - offset,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Decorative background gradients */}
            <Box sx={{ position: 'fixed', top: '5%', left: '-15%', width: '50%', height: '50%', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, filter: 'blur(80px)', background: 'radial-gradient(circle,rgba(0,137,123,0.12) 0%, transparent 70%)' }} />
            <Box sx={{ position: 'fixed', bottom: '10%', right: '-10%', width: '45%', height: '45%', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, filter: 'blur(100px)', background: 'radial-gradient(circle,rgba(92,107,192,0.10) 0%, transparent 70%)' }} />

            {/* Header — responsive: absolute on xs, fixed on md+ */}
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
                    transition: 'all 0.3s',
                    backdropFilter: { md: 'blur(12px)' },
                    backgroundColor: scrolled
                        ? { md: 'rgba(var(--mui-palette-background-defaultChannel) / 0.8)' }
                        : { md: 'rgba(var(--mui-palette-background-defaultChannel) / 0.4)' },
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
                                priority
                            />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                DriveGate
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {firstToggleVisible && <ThemeToggle />}

                            <AnimatePresence>
                                {secondToggleVisible && (
                                    <m.div
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 100, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
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
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <main>
                <HeroSection onVisibilityChange={setHeroButtonVisible} onHowItWorksClick={handleHowItWorksClick} />
                <WhatIsSection />
                <ProblemSolutionSection />
                <FeaturesSection />
                <UseCasesSection />
                <TutorialSection ref={tutorialRef} />
                <TrustSection />
                <FAQSection />
            </main>

            <FooterSection />

            <AnimatePresence>
                {showInvalidLinkMessage && (
                    <>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInvalidLinkMessage(false)}
                            style={{ position: 'fixed', inset: 0, zIndex: 1300, backdropFilter: 'blur(16px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />

                        <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1400, width: { xs: 'calc(100% - 32px)', sm: 'auto' }, maxWidth: 380 }}>
                            <m.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            >
                                <Paper
                                    elevation={24}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        textAlign: 'center',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                                        <LinkOff sx={{ fontSize: 40, color: '#E65100' }} />
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                        Link Not Found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        That upload link doesn&apos;t exist. Please check the URL and try again.
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowInvalidLinkMessage(false)}
                                        sx={{ borderRadius: 100, px: 4, py: 1 }}
                                    >
                                        Got it
                                    </Button>
                                </Paper>
                            </m.div>
                        </Box>
                    </>
                )}
            </AnimatePresence>
        </Box>
    );
}
