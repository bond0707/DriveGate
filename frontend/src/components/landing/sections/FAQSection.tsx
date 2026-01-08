'use client';
import { useState } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import AnimatedSection from '../../AnimatedSection';

const faqs = [
    {
        question: 'Is this free?',
        answer: 'Yes, DriveGate is completely free for personal use. We believe secure file transfers should be accessible to everyone.',
    },
    {
        question: 'What happens if I lose my phone?',
        answer: 'No problem! Log in with Google on your dashboard, then either: (1) Rescan the same QR code to add it to a new authenticator app, or (2) Reset your TOTP to generate a completely new code. The old codes will stop working after a reset.',
    },
    {
        question: 'Can I download files using DriveGate?',
        answer: 'No, DriveGate is upload-only by design. This is a security feature that ensures nobody can extract files from your drive using a compromised TOTP code.',
    },
    {
        question: 'Do you read my files?',
        answer: 'No. Your files are encrypted in transit (TLS) and streamed directly to your Google Drive. We never inspect, store, or log your file contents.',
    },
    {
        question: 'Why do you need Google Drive permissions?',
        answer: 'We use the minimal "drive.file" scope. DriveGate creates a folder during setup (as you specify), and stores files there when users upload them. We cannot see, read, or modify any of your existing personal files.',
    },
];

export default function FAQSection() {
    const [expanded, setExpanded] = useState<number | false>(false);

    return (
        <Box
            component="section"
            sx={{
                py: { xs: 10, md: 16 },
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="md">
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
                        FAQ
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            mb: 6,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                    >
                        Common questions.
                    </Typography>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    {faqs.map((faq, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === index}
                            onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}
                            elevation={0}
                            sx={{
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '16px !important',
                                mb: 2,
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': {
                                    margin: 0,
                                    mb: 2,
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ChevronDown size={20} />}
                                sx={{
                                    py: 1,
                                    px: 3,
                                    '& .MuiAccordionSummary-content': {
                                        my: 2,
                                    },
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                    {faq.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </AnimatedSection>
            </Container>
        </Box>
    );
}
