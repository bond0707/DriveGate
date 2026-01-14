'use client';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Container, Typography, Paper, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, QrCode, Upload, LogIn, Link as LinkIcon, FolderPlus, Smartphone } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';

const MotionBox = motion.create(Box);

const tutorialSteps = [
    {
        step: 1,
        title: 'Sign in with Google',
        description: 'Click "Sign in with Google" and allow DriveGate to access your account. We only request minimal permissions.',
        icon: LogIn,
        color: '#4285F4',
    },
    {
        step: 2,
        title: 'Set up your authenticator',
        description: 'Scan the QR code with Google Authenticator, Authy, or any TOTP app. This generates time-based codes for secure uploads.',
        icon: QrCode,
        color: '#00897B',
    },
    {
        step: 3,
        title: 'Choose your URL',
        description: 'Pick a custom URL slug for your upload page.',
        example: 'drivegate.dev/my-uploads',
        icon: LinkIcon,
        color: '#5C6BC0',
    },
    {
        step: 4,
        title: 'Create your folder',
        description: 'Name the folder in your Google Drive where uploaded files will be stored.',
        icon: FolderPlus,
        color: '#F59E0B',
    },
    {
        step: 5,
        title: 'Upload from anywhere',
        description: 'Visit your custom URL on any device, enter your 6-digit code, and drop files. No login required!',
        icon: Upload,
        color: '#10B981',
    },
];

export interface TutorialSectionHandle {
    resetStep: () => void;
}

const TutorialSection = forwardRef<TutorialSectionHandle>((_, ref) => {
    const [activeStep, setActiveStep] = useState(0);
    const [totpInfoOpen, setTotpInfoOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        resetStep: () => setActiveStep(0),
    }));

    const handleNext = () => {
        if (activeStep < tutorialSteps.length - 1) {
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrev = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
    };

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
                    <Box sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
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

                {/* Step indicators */}
                <AnimatedSection delay={0.2}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: { xs: 1, md: 2 },
                            mb: 4,
                            flexWrap: 'wrap',
                        }}
                    >
                        {tutorialSteps.map((step, index) => (
                            <MotionBox
                                key={index}
                                onClick={() => setActiveStep(index)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    backgroundColor: activeStep === index ? step.color : 'transparent',
                                    borderColor: activeStep === index ? step.color : undefined,
                                }}
                                transition={{ duration: 0.3 }}
                                sx={{
                                    width: { xs: 40, md: 48 },
                                    height: { xs: 40, md: 48 },
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: { xs: '0.875rem', md: '1rem' },
                                    color: activeStep === index ? 'white' : 'text.secondary',
                                }}
                            >
                                {step.step}
                            </MotionBox>
                        ))}
                    </Box>
                </AnimatedSection>

                {/* Active step content with side arrows */}
                <AnimatedSection delay={0.3}>
                    <Box
                        sx={{
                            maxWidth: 700,
                            mx: 'auto',
                            minHeight: { xs: 300, md: 340 },
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 1, md: 2 },
                        }}
                    >
                        {/* Left Arrow */}
                        {activeStep > 0 && (
                            <MotionBox
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handlePrev}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                sx={{
                                    width: { xs: 36, md: 48 },
                                    height: { xs: 36, md: 48 },
                                    borderRadius: '50%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: { xs: 'flex', md: 'flex' },
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    '&:hover': { borderColor: 'primary.main' },
                                }}
                            >
                                <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
                            </MotionBox>
                        )}
                        {activeStep === 0 && <Box sx={{ width: { xs: 36, md: 48 }, flexShrink: 0 }} />}

                        {/* Content Card */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <AnimatePresence mode="wait">
                                <MotionBox
                                    key={activeStep}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    sx={{
                                        p: { xs: 3, md: 6 },
                                        borderRadius: { xs: 3, md: 4 },
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
                                        textAlign: 'center',
                                    }}
                                >
                                    {/* Icon */}
                                    <MotionBox
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
                                        sx={{
                                            width: { xs: 60, md: 80 },
                                            height: { xs: 60, md: 80 },
                                            borderRadius: { xs: 2, md: 3 },
                                            background: tutorialSteps[activeStep].color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: { xs: 2, md: 3 },
                                        }}
                                    >
                                        {(() => {
                                            const IconComponent = tutorialSteps[activeStep].icon;
                                            return <IconComponent size={32} color="white" />;
                                        })()}
                                    </MotionBox>

                                    {/* Title */}
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            mb: { xs: 1.5, md: 2 },
                                            fontSize: { xs: '1.1rem', md: '1.5rem' },
                                        }}
                                    >
                                        {tutorialSteps[activeStep].title}
                                    </Typography>

                                    {/* Description */}
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.7,
                                            maxWidth: 400,
                                            mx: 'auto',
                                        }}
                                    >
                                        {tutorialSteps[activeStep].description}
                                        {(tutorialSteps[activeStep] as { example?: string }).example && (
                                            <Box component="span" sx={{ display: 'block', mt: 1 }}>
                                                Example: <Box component="code" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                    {(tutorialSteps[activeStep] as { example?: string }).example}
                                                </Box>
                                            </Box>
                                        )}
                                    </Typography>
                                </MotionBox>
                            </AnimatePresence>
                        </Box>

                        {/* Right Arrow */}
                        {activeStep < tutorialSteps.length - 1 && (
                            <MotionBox
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleNext}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                sx={{
                                    width: { xs: 36, md: 48 },
                                    height: { xs: 36, md: 48 },
                                    borderRadius: '50%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: { xs: 'flex', md: 'flex' },
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    '&:hover': { borderColor: 'primary.main' },
                                }}
                            >
                                <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
                            </MotionBox>
                        )}
                        {activeStep === tutorialSteps.length - 1 && <Box sx={{ width: { xs: 36, md: 48 }, flexShrink: 0 }} />}
                    </Box>
                </AnimatedSection>
            </Container>
        </Box>
    );
});

TutorialSection.displayName = 'TutorialSection';

export default TutorialSection;
