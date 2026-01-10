'use client';
import { Box, Container, Typography } from '@mui/material';
import AnimatedSection from '../../AnimatedSection';

export default function ProblemSolutionSection() {
    return (
        <Box
            component="section"
            sx={{
                py: { xs: 10, md: 16 },
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: { xs: 6, md: 10 },
                    }}
                >
                    {/* Problem */}
                    <AnimatedSection slideDirection="left">
                        <Box
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: 'error.main',
                                bgcolor: 'rgba(244, 67, 54, 0.04)',
                            }}
                        >
                            <Typography
                                variant="overline"
                                sx={{ color: 'error.main', fontWeight: 700, letterSpacing: 2 }}
                            >
                                The Problem
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, mt: 2, mb: 3, color: 'text.primary' }}
                            >
                                Public devices are risky.
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                Need to save a file from a college computer, a friend&apos;s laptop, a cyber cafe, or a print shop?
                                Logging into your full cloud account on a public device is risky.
                                Session cookies, keyloggers, and prying eyes make your data vulnerable.
                            </Typography>
                        </Box>
                    </AnimatedSection>

                    {/* Solution */}
                    <AnimatedSection slideDirection="right" delay={0.2}>
                        <Box
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(0, 137, 123, 0.04)',
                            }}
                        >
                            <Typography
                                variant="overline"
                                sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
                            >
                                The Solution
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, mt: 2, mb: 3, color: 'text.primary' }}
                            >
                                Upload without logging in.
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                DriveGate lets you upload files using a temporary 6-digit code from your phone, just like
                                the codes banking apps use. No password needed on the public device. No trace left behind.
                                Your files go straight to your Drive, safely.
                            </Typography>
                        </Box>
                    </AnimatedSection>
                </Box>
            </Container>
        </Box>
    );
}
