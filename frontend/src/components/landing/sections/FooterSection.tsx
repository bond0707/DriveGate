'use client';
import { useState } from 'react';
import { Box, Container, Typography, Button, Link, IconButton, Paper } from '@mui/material';
import { GitHub, Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useColorScheme } from '@mui/material/styles';
import Image from 'next/image';

const MotionPaper = motion.create(Paper);

export default function FooterSection() {
    const [contactOpen, setContactOpen] = useState(false);
    const { mode } = useColorScheme();

    return (
        <>
            <Box
                component="footer"
                sx={{
                    py: 4,
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        {/* Legal Links */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Link
                                href="/privacy"
                                sx={{
                                    color: 'text.secondary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                }}
                            >
                                Privacy Policy
                            </Link>
                            <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>•</Typography>
                            <Link
                                href="/terms"
                                sx={{
                                    color: 'text.secondary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    '&:hover': { color: 'primary.main' },
                                }}
                            >
                                Terms of Service
                            </Link>
                            <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>•</Typography>
                            <Link
                                component="button"
                                onClick={() => setContactOpen(true)}
                                sx={{
                                    color: 'text.secondary',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    '&:hover': { color: 'primary.main' },
                                }}
                            >
                                Contact Us
                            </Link>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            © 2026 DriveGate. All rights reserved.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Contact Modal */}
            <AnimatePresence>
                {contactOpen && (
                    <>
                        {/* Backdrop with blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setContactOpen(false)}
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
                            }}
                        >
                            <MotionPaper
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                elevation={24}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    minWidth: { xs: 280, sm: 400 },
                                    maxWidth: 450,
                                    position: 'relative',
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                {/* Content */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mb: 2,
                                    }}
                                >
                                    <Image
                                        src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                                        alt="DriveGate"
                                        width={100}
                                        height={100}
                                    />
                                </Box>

                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                    Made with passion
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    DriveGate is built and maintained by
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<GitHub />}
                                        href="https://github.com/bond0707"
                                        target="_blank"
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 100,
                                            py: 1.5,
                                        }}
                                    >
                                        bond0707
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<GitHub />}
                                        href="https://github.com/koffandaff"
                                        target="_blank"
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 100,
                                            py: 1.5,
                                        }}
                                    >
                                        koffandaff
                                    </Button>
                                </Box>
                            </MotionPaper>
                        </Box>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

