'use client';
import { useState, useRef, useEffect, startTransition } from 'react';
import { Box, Container, Typography, Button, useColorScheme, Paper } from '@mui/material';
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { LinkOff } from '@mui/icons-material';
import Image from 'next/image';
import ThemeToggle from '../ThemeToggle';
import HeroSection from './sections/HeroSection';
import WhatIsSection from './sections/WhatIsSection';
import ProblemSolutionSection from './sections/ProblemSolutionSection';
import FeaturesSection from './sections/FeaturesSection';
import UseCasesSection from './sections/UseCasesSection';
import TutorialSection from './sections/TutorialSection';
import TrustSection from './sections/TrustSection';
import FAQSection from './sections/FAQSection';
import FooterSection from './sections/FooterSection';
import type { TutorialSectionHandle } from './sections/TutorialSection';

export default function LandingPage() {
    const { mode } = useColorScheme();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [showNavButton, setShowNavButton] = useState(false);
    const [showInvalidLinkMessage, setShowInvalidLinkMessage] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const tutorialRef = useRef<TutorialSectionHandle>(null);

    // Check for invalid_link query parameter
    useEffect(() => {
        if (searchParams.get('invalid_link') === 'true') {
            // Use startTransition to avoid lint warning about setState in effect
            startTransition(() => {
                setShowInvalidLinkMessage(true);
            });
            // Clean URL without reloading the page
            router.replace('/', { scroll: false });
            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => setShowInvalidLinkMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    // Header blur state
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50);
    });

    // Proportional & responsive hero scroll progress (0.0 = top of hero, 1.0 = scrolled past hero)
    const { scrollYProgress: heroScrollProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    useMotionValueEvent(heroScrollProgress, "change", (progress) => {
        // Hysteresis deadband (0.45 ↔ 0.60) prevents boundary jitter on all screen resolutions
        if (progress > 0.60) {
            setShowNavButton(true);
        } else if (progress < 0.45) {
            setShowNavButton(false);
        }
    });

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
                        <motion.div
                            layout
                            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        >
                            <motion.div
                                layout
                                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            >
                                <ThemeToggle />
                            </motion.div>

                            {/* Get Started button that slides in when scrolled past hero */}
                            <AnimatePresence mode="popLayout">
                                {showNavButton && (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                        transition={{
                                            opacity: { duration: 0.2 },
                                            x: { type: 'spring', damping: 26, stiffness: 220 },
                                            scale: { duration: 0.2 },
                                            layout: { type: 'spring', damping: 26, stiffness: 220 }
                                        }}
                                    >
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
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            Get Started
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <main>
                <HeroSection ref={heroRef} onHowItWorksClick={handleHowItWorksClick} />
                <WhatIsSection />
                <ProblemSolutionSection />
                <FeaturesSection />
                <UseCasesSection />
                <TutorialSection ref={tutorialRef} />
                <TrustSection />
                <FAQSection />
            </main>

            <FooterSection />

            {/* Invalid Link Modal */}
            <AnimatePresence>
                {showInvalidLinkMessage && (
                    <>
                        {/* Backdrop with blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInvalidLinkMessage(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1300,
                                backdropFilter: 'blur(8px)',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}
                        />

                        {/* Modal Card */}
                        <Box
                            sx={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1400,
                                width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                                maxWidth: 380,
                            }}
                        >
                            <motion.div
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
                                    <Box sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        bgcolor: '#FFF3E0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}>
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
                                        sx={{
                                            borderRadius: 100,
                                            px: 4,
                                            py: 1,
                                        }}
                                    >
                                        Got it
                                    </Button>
                                </Paper>
                            </motion.div>
                        </Box>
                    </>
                )}
            </AnimatePresence>
        </Box>
    );
}
