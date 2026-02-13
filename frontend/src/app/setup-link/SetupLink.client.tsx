'use client';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Link as LinkIcon,
    ArrowForward,
    Close,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function SetupLinkClient() {
    const router = useRouter();
    const { user, checkAuth } = useAuth();
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);


    useEffect(() => {
        // user might be null initially if loading, but assuming protected route or handled by layout
        if (user?.url_slug) {
            setSlug(user.url_slug);
            setIsUpdate(true);
        }
    }, [user]);

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            localStorage.removeItem('link_mode');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Update page title based on mode
    useEffect(() => {
        if (isUpdate) {
            document.title = 'Update Upload Link | DriveGate';
        } else {
            document.title = 'Setup Upload Link | DriveGate';
        }
    }, [isUpdate]);

    const handleClose = () => {
        router.push('/dashboard');
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(value);
        setError('');
    };

    const handleCreate = async () => {
        if (slug.length < 3) {
            setError('Link must be at least 3 characters');
            return;
        }

        // Check if slug actually changed (only for updates)
        if (isUpdate && slug === user?.url_slug) {
            setError("That's already your current link");
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            await api.patch('/url/slug', { url_slug: slug });
            await checkAuth(); // Refresh user data to update context

            // First-time setup: continue to folder setup
            // Update mode: go back to dashboard
            if (!isUpdate) {
                router.push('/setup-folder');
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            console.error('Failed to update slug:', err);
            const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
            // Handle 409 Conflict cleanly
            if (axiosErr.response?.status === 409) {
                setError('This link is already taken.');
            } else {
                setError(axiosErr.response?.data?.detail || 'Failed to update link.');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const previewUrl = `drivegate.app/${slug || 'your-link'}`;

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            p: 2,
        }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <ThemeToggle />
                {isUpdate && (
                    <IconButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
                        <Close />
                    </IconButton>
                )}
            </Box>

            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        width: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                    }}
                >
                    <MotionBox
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                    >
                        <Box sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            borderRadius: '50%',
                            bgcolor: '#5C6BC0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                        }}>
                            <LinkIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                        </Box>
                    </MotionBox>

                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
                        {isUpdate ? 'Update Upload Link' : 'Create Upload Link'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Choose a custom URL for file uploads
                    </Typography>

                    <Box sx={{
                        bgcolor: 'action.hover',
                        p: 1.5,
                        borderRadius: 2,
                        mb: 3,
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            {previewUrl}
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        value={slug}
                        onChange={handleSlugChange}
                        placeholder="my-upload-link"
                        error={!!error}
                        helperText={error || 'Lowercase letters, numbers, hyphens only'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography color="text.secondary">/</Typography>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleCreate}
                            disabled={!slug || slug.length < 3 || isCreating}
                            endIcon={isCreating ? <SquircleLoader size={20} color="white" /> : <ArrowForward />}
                            sx={{ py: 1.5 }}
                        >
                            {isCreating ? 'Saving...' : isUpdate ? 'Update' : 'Create Link'}
                        </Button>
                    </motion.div>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                        You will need your TOTP code to upload
                    </Typography>
                </MotionPaper>
            </Container>
        </Box>
    );
}
