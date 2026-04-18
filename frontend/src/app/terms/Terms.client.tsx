'use client';
import { Box, Container, Typography, Link, useColorScheme } from '@mui/material';
import { m } from 'framer-motion';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import { FileText, Mail, Shield, AlertTriangle, Users, Scale, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { MotionPaper } from '@/components/motion';

export default function TermsClient() {
    const { mode } = useColorScheme();

    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            icon: FileText,
            content: (
                <Typography component="p" gutterBottom>
                    By accessing or using DriveGate (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
                    If you disagree with any part of the terms, you may not access the Service.
                </Typography>
            ),
        },
        {
            id: 'description',
            title: '2. Description of Service',
            icon: Shield,
            content: (
                <Typography component="p" gutterBottom>
                    DriveGate is a web application that facilitates the uploading of files to your personal Google Drive storage
                    using the Google Drive API. The Service is provided &quot;AS IS&quot; and is intended for educational, portfolio, and personal use.
                </Typography>
            ),
        },
        {
            id: 'accounts',
            title: '3. User Accounts and Security',
            icon: Users,
            content: (
                <Box component="ul" sx={{ pl: 3 }}>
                    <li><Typography><strong>Google Account:</strong> You are responsible for maintaining the security of your Google Account.
                        DriveGate is not liable for any loss or damage arising from your failure to protect your login credentials.</Typography></li>
                    <li><Typography><strong>Access:</strong> You are solely responsible for the activity that occurs under your account.</Typography></li>
                </Box>
            ),
        },
        {
            id: 'conduct',
            title: '4. User Conduct',
            icon: AlertTriangle,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        You agree not to use the Service to:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        <li><Typography>Upload viruses, malware, ransomware, or any other malicious code.</Typography></li>
                        <li><Typography>Upload content that is illegal, harmful, or violates the intellectual property rights of others.</Typography></li>
                        <li><Typography>Attempt to disrupt, overwhelm, or reverse-engineer the Service infrastructure.</Typography></li>
                        <li><Typography>Violate Google&apos;s Acceptable Use Policy.</Typography></li>
                    </Box>
                </>
            ),
        },
        {
            id: 'ip',
            title: '5. Intellectual Property',
            icon: Scale,
            content: (
                <Typography component="p" gutterBottom>
                    The Service and its original content (excluding content provided by users), features, and functionality are and
                    will remain the exclusive property of DriveGate and its developers.
                </Typography>
            ),
        },
        {
            id: 'termination',
            title: '6. Termination',
            icon: XCircle,
            content: (
                <Typography component="p" gutterBottom>
                    We may terminate or suspend your access to the Service immediately, without prior notice or liability,
                    for any reason whatsoever, including without limitation if you breach the Terms.
                </Typography>
            ),
        },
        {
            id: 'disclaimer',
            title: '7. Disclaimer of Warranties',
            icon: AlertCircle,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The developers of DriveGate make no
                        representations or warranties of any kind, express or implied, regarding the operation of the Service.
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        <li><Typography>We do not guarantee that the Service will be uninterrupted, secure, or error-free.</Typography></li>
                        <li><Typography>We are not responsible for any failed uploads, corrupted files, or data loss that may occur during the transfer process.</Typography></li>
                    </Box>
                </>
            ),
        },
        {
            id: 'liability',
            title: '8. Limitation of Liability',
            icon: Shield,
            content: (
                <Typography component="p" gutterBottom>
                    In no event shall the developers of DriveGate be liable for any indirect, incidental, special, consequential,
                    or punitive damages, including without limitation, loss of data, use, goodwill, or other intangible losses,
                    resulting from your access to or use of (or inability to access or use) the Service.
                </Typography>
            ),
        },
        {
            id: 'changes',
            title: '9. Changes to Terms',
            icon: RefreshCw,
            content: (
                <Typography component="p" gutterBottom>
                    We reserve the right to modify or replace these Terms at any time. By continuing to access or use our Service
                    after those revisions become effective, you agree to be bound by the revised terms.
                </Typography>
            ),
        },
        {
            id: 'contact',
            title: '10. Contact Us',
            icon: Mail,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        If you have any questions about these Terms, please contact us at:
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                        Email: <Link href="mailto:support@drivegate.app">support@drivegate.app</Link>
                    </Typography>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box
                component="header"
                sx={{
                    py: 2,
                    px: { xs: 2, md: 4 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backdropFilter: 'blur(12px)',
                    bgcolor: 'rgba(var(--mui-palette-background-defaultChannel) / 0.8)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}>
                            <Image
                                src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
                                alt="DriveGate"
                                width={32}
                                height={32}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                DriveGate
                            </Typography>
                        </Link>
                        <ThemeToggle />
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box
                sx={{
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(0, 137, 123, 0.05) 0%, transparent 100%)',
                }}
            >
                <Container maxWidth="md">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 3,
                                bgcolor: '#5C6BC0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <Scale size={40} color="white" />
                        </Box>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                            Terms of Service
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
                            Last Updated: January 10, 2026
                        </Typography>
                    </m.div>
                </Container>
            </Box>

            {/* Content */}
            <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
                {sections.map((section, index) => (
                    <MotionPaper
                        key={section.id}
                        id={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            mb: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(92, 107, 192, 0.1)',
                                    color: '#5C6BC0',
                                    display: 'flex',
                                }}
                            >
                                <section.icon size={24} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {section.title}
                            </Typography>
                        </Box>
                        <Box sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                            {section.content}
                        </Box>
                    </MotionPaper>
                ))}
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 4,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary">
                        © 2026 DriveGate. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}
