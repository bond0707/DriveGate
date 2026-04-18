'use client';
import { Box, Container, Typography, Link, useColorScheme } from '@mui/material';
import { m } from 'framer-motion';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import { Shield, Mail, Database, Cloud, Eye, Lock, FileText, ExternalLink } from 'lucide-react';
import { MotionPaper } from '@/components/motion';

export default function PrivacyClient() {
    const { mode } = useColorScheme();

    const sections = [
        {
            id: 'introduction',
            title: '1. Introduction',
            icon: FileText,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        Welcome to DriveGate (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
                    </Typography>
                    <Typography component="p" gutterBottom>
                        By using DriveGate, you agree to the collection and use of information in accordance with this policy.
                    </Typography>
                </>
            ),
        },
        {
            id: 'info-collected',
            title: '2. Information We Collect',
            icon: Database,
            content: (
                <>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
                        A. Google Account Information
                    </Typography>
                    <Typography component="p" gutterBottom>
                        When you log in using Google, we collect the following personal information:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                        <li><Typography><strong>Email Address:</strong> Used to identify your account and maintain your session.</Typography></li>
                        <li><Typography><strong>Full Name:</strong> Used to personalize the user interface.</Typography></li>
                        <li><Typography><strong>Profile Picture:</strong> Used to display your avatar in the application.</Typography></li>
                        <li><Typography><strong>Google Account ID:</strong> A unique identifier used to securely link your account to our database.</Typography></li>
                    </Box>

                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
                        B. Google Drive Access
                    </Typography>
                    <Typography component="p" gutterBottom>
                        We request access to your Google Drive (specifically the <code>https://www.googleapis.com/auth/drive.file</code> scope).
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        <li><Typography><strong>Limited Access:</strong> We only have access to files created or opened by DriveGate. We cannot see your entire Google Drive library or files created by other applications.</Typography></li>
                        <li><Typography><strong>Purpose:</strong> This permission is strictly required to perform the core function of the app: uploading the files you select to your specific Google Drive folder.</Typography></li>
                    </Box>
                </>
            ),
        },
        {
            id: 'usage',
            title: '3. How We Use Your Information',
            icon: Eye,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        We use the collected data for the following purposes:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                        <li><Typography><strong>Authentication:</strong> To verify your identity and maintain your login session.</Typography></li>
                        <li><Typography><strong>Service Operation:</strong> To upload files to your Google Drive as explicitly requested by you.</Typography></li>
                        <li><Typography><strong>Communication:</strong> To contact you regarding critical account issues (e.g., security alerts).</Typography></li>
                    </Box>
                    <Typography component="p" sx={{ fontWeight: 600, mb: 2 }}>
                        We do not sell, trade, or rent your personal identification information to others.
                    </Typography>
                </>
            ),
        },
        {
            id: 'file-handling',
            title: '4. File Handling and Storage',
            icon: Lock,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        We prioritize your privacy regarding file uploads:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        <li><Typography><strong>No Persistent Storage:</strong> We utilize a &quot;pass-through&quot; streaming architecture. When you upload a file, its metadata is processed in memory and your file is sent directly to Google&apos;s servers.</Typography></li>
                        <li><Typography><strong>No Retention:</strong> We do not save, store, or view your files on our servers (Vercel/Database) at any point. Once the upload to Google Drive is complete, the data is immediately flushed from memory.</Typography></li>
                    </Box>
                </>
            ),
        },
        {
            id: 'third-party',
            title: '5. Third-Party Service Providers',
            icon: Cloud,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        We use trusted third-party services to operate our application. These providers may have access to technical data solely for the purpose of performing tasks on our behalf:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        <li><Typography><strong>Vercel:</strong> Used for hosting the application frontend and backend infrastructure.</Typography></li>
                        <li><Typography><strong>Google Cloud Platform:</strong> Used for identity verification (OAuth) and file storage APIs.</Typography></li>
                    </Box>
                </>
            ),
        },
        {
            id: 'analytics',
            title: '6. Analytics and Tracking',
            icon: Eye,
            content: (
                <Typography component="p" gutterBottom>
                    We do not use third-party analytics software (such as Google Analytics, Mixpanel, or Facebook Pixel) and we do not track your activity across other websites.
                </Typography>
            ),
        },
        {
            id: 'compliance',
            title: '7. Compliance with Google API Services User Data Policy',
            icon: Shield,
            content: (
                <Typography component="p" gutterBottom>
                    DriveGate&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                    <Link
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                    >
                        Google API Services User Data Policy
                        <ExternalLink size={14} />
                    </Link>
                    , including the Limited Use requirements.
                </Typography>
            ),
        },
        {
            id: 'rights',
            title: '8. Your Data Rights',
            icon: FileText,
            content: (
                <Box component="ul" sx={{ pl: 3 }}>
                    <li><Typography><strong>Revoking Access:</strong> You may revoke DriveGate&apos;s access to your Google Drive at any time via your{' '}
                        <Link href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                            Google Account Permissions settings
                        </Link>.
                    </Typography></li>
                    <li><Typography><strong>Account Deletion:</strong> You may request the deletion of your account and associated database records by contacting us.</Typography></li>
                </Box>
            ),
        },
        {
            id: 'contact',
            title: '9. Contact Us',
            icon: Mail,
            content: (
                <>
                    <Typography component="p" gutterBottom>
                        If you have any questions about this Privacy Policy, please contact us at:
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
                                bgcolor: '#00897B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <Shield size={40} color="white" />
                        </Box>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                            Privacy Policy
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
                                    bgcolor: 'rgba(0, 137, 123, 0.1)',
                                    color: '#00897B',
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
