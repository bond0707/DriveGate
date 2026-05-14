'use client';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { CloudUpload, Shield, Smartphone } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';

const MotionPaper = motion.create(Paper);

const highlights = [
    {
        icon: CloudUpload,
        title: 'Secure Upload Portal',
        description: 'A personal gateway to your Google Drive that only you can unlock.',
        color: '#00897B',
    },
    {
        icon: Smartphone,
        title: 'Authenticator Protected',
        description: 'Uses the same TOTP technology trusted by banks and tech companies.',
        color: '#5C6BC0',
    },
    {
        icon: Shield,
        title: 'Upload-Only Access',
        description: 'Files go in, but nothing can be read, downloaded, or deleted.',
        color: '#F59E0B',
    },
];

export default function WhatIsSection() {
    return (
        <Box
            component="section"
            sx={{
                py: { xs: 8, md: 12 },
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
                        What is DriveGate?
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.25rem' },
                        }}
                    >
                        Your private upload link to Google Drive.
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            textAlign: { xs: 'justify', md: 'center' },
                            mb: 6,
                            maxWidth: 700,
                            mx: 'auto',
                            lineHeight: 1.8,
                        }}
                    >
                        DriveGate creates a secure, shareable URL that lets you upload files to your Google Drive
                        from any device, without logging into your Google account. Perfect for public computers,
                        borrowed devices, or anywhere you don&apos;t want to enter your password.
                    </Typography>
                </AnimatedSection>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                        gap: 3,
                    }}
                >
                    {highlights.map((item, index) => (
                        <AnimatedSection key={item.title} delay={index * 0.1}>
                            <MotionPaper
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    textAlign: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        bgcolor: item.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}
                                >
                                    <item.icon size={24} color="white" />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {item.description}
                                </Typography>
                            </MotionPaper>
                        </AnimatedSection>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
