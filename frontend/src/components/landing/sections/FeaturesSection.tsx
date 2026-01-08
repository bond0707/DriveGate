'use client';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Shield, Ghost, Zap, Lock } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';

const MotionPaper = motion.create(Paper);

const features = [
    {
        icon: Shield,
        title: 'TOTP Security',
        description: 'Powered by Time-based One-Time Passwords. Codes expire every 30 seconds.',
        gradient: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
    },
    {
        icon: Ghost,
        title: 'Ghost Access',
        description: 'One-way transfer only. You can put files in, but nobody can see or steal what\'s already inside your drive.',
        gradient: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)',
    },
    {
        icon: Zap,
        title: 'Zero-Login Uploads',
        description: 'Upload from a browser without logging into Google. No credentials exposed.',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    },
    {
        icon: Lock,
        title: 'Privacy First',
        description: 'We don\'t store your files. They are uploaded directly to your private storage.',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    },
];

export default function FeaturesSection() {
    return (
        <Box
            component="section"
            sx={{
                py: { xs: 10, md: 16 },
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
                        Features
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            mb: 8,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                    >
                        Built for security-conscious users.
                    </Typography>
                </AnimatedSection>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 3,
                    }}
                >
                    {features.map((feature, index) => (
                        <AnimatedSection key={feature.title} delay={index * 0.1}>
                            <MotionPaper
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                                elevation={0}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    borderRadius: 4,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    cursor: 'default',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 3,
                                        background: feature.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                    }}
                                >
                                    <feature.icon size={28} color="white" />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                    {feature.description}
                                </Typography>
                            </MotionPaper>
                        </AnimatedSection>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
