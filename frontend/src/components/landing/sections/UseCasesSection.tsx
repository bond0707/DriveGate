'use client';
import { Box, Container, Typography } from '@mui/material';
import { MotionPaper } from '@/components/motion';
import { GraduationCap, Printer, Users, Globe, Briefcase, Building } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';

const useCases = [
    {
        icon: GraduationCap,
        title: 'College & University',
        description: 'Save assignments, projects, or research from lab computers without risking your Google login.',
    },
    {
        icon: Printer,
        title: 'Print & Copy Shops',
        description: 'Upload documents for printing without leaving your credentials on a shared machine.',
    },
    {
        icon: Users,
        title: 'Borrowed Devices',
        description: 'Get files from a friend\'s or family member\'s computer securely.',
    },
    {
        icon: Globe,
        title: 'While Traveling',
        description: 'Upload from hotel business centers, airport lounges, or internet cafes safely.',
    },
    {
        icon: Briefcase,
        title: 'Shared Workstations',
        description: 'Transfer files at offices, co-working spaces, or conference rooms.',
    },
    {
        icon: Building,
        title: 'Public Libraries',
        description: 'Save documents from library computers without security concerns.',
    },
];

export default function UseCasesSection() {
    return (
        <Box
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
                        Use Cases
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
                        Perfect for these situations.
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            textAlign: { xs: 'justify', md: 'center' },
                            mb: 6,
                            maxWidth: 600,
                            mx: 'auto',
                        }}
                    >
                        Any time you need to upload files but don&apos;t want to log into your Google account.
                    </Typography>
                </AnimatedSection>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                        gap: 3,
                    }}
                >
                    {useCases.map((useCase, index) => (
                        <AnimatedSection key={useCase.title} delay={index * 0.08}>
                            <MotionPaper
                                whileHover={{ y: -4, borderColor: '#00897B' }}
                                transition={{ duration: 0.2 }}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        bgcolor: 'action.hover',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: 'primary.main',
                                    }}
                                >
                                    <useCase.icon size={20} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {useCase.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, textAlign: { xs: 'justify', md: 'left' } }}>
                                        {useCase.description}
                                    </Typography>
                                </Box>
                            </MotionPaper>
                        </AnimatedSection>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
