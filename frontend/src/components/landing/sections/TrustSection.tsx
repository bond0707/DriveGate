'use client';
import { Box, Container, Typography } from '@mui/material';
import { Shield, CheckCircle } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';

const permissions = [
    {
        scope: 'drive.file',
        description: 'Creates a folder during setup and stores uploaded files there. We can only access this folder, not your other Drive files.',
    },
    {
        scope: 'openid',
        description: 'Provides a unique Google identifier (UUID) for account uniqueness in our database.',
    },
    {
        scope: 'profile',
        description: 'Provides your display name (used as username) and profile picture (shown in dashboard).',
    },
    {
        scope: 'email',
        description: 'Provides your email address for account identification and storage.',
    },
];

export default function TrustSection() {
    return (
        <Box
            component="section"
            sx={{
                py: { xs: 10, md: 16 },
            }}
        >
            <Container maxWidth="md">
                <AnimatedSection>
                    <Box
                        sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: 4,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(0, 137, 123, 0.03)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <Shield size={32} style={{ color: '#00897B' }} />
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Transparency & Permissions
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                mb: 4,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Zero Trust Architecture
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, textAlign: { xs: 'justify', md: 'left' } }}>
                                Your files are streamed directly to your drive, never stored on our servers.
                                We act as a secure relay, nothing more.
                            </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Google Permissions We Use
                        </Typography>

                        {permissions.map((perm, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    mb: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <CheckCircle size={20} style={{ color: '#00897B', flexShrink: 0, marginTop: 2 }} />
                                <Box>
                                    <Typography
                                        component="code"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            color: 'primary.main',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {perm.scope}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: { xs: 'justify', md: 'left' } }}>
                                        {perm.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </AnimatedSection>
            </Container>
        </Box>
    );
}
