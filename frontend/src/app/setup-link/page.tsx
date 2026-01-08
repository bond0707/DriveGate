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
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    Link as LinkIcon,
    ArrowForward,
    Close,
    CheckCircle,
    Cancel,
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

export default function SetupLinkPage() {
    const router = useRouter();
    const muiTheme = useTheme();
    const { user, checkAuth } = useAuth();
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
        // user might be null initially if loading, but assuming protected route or handled by layout
        if (user?.url_slug) {
            setSlug(user.url_slug);
            setIsUpdate(true);
        }
    }, [user]);

    // Live Check with Debounce
    useEffect(() => {
        const checkAvailability = async () => {
            if (!slug || slug.length < 3 || slug === user?.url_slug) {
                setIsAvailable(null);
                return;
            }

            setIsChecking(true);
            try {
                const response = await api.get(`/url/check-availability?slug=${slug}`);
                setIsAvailable(response.data.available);
                if (!response.data.available) {
                    setError('This link is already taken');
                } else {
                    setError('');
                }
            } catch (err) {
                console.error('Failed to check availability', err);
            } finally {
                setIsChecking(false);
            }
        };

        const timer = setTimeout(() => {
            checkAvailability();
        }, 500);

        return () => clearTimeout(timer);
    }, [slug, user]);

    const handleClose = () => {
        router.push('/dashboard');
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setSlug(value);
        setError('');
        setIsAvailable(null); // Reset status while typing
    };

    const handleCreate = async () => {
        if (slug.length < 3) {
            setError('Link must be at least 3 characters');
            return;
        }
        if (isAvailable === false) {
            setError('This link is already taken');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            await api.patch('/url/update', { url_slug: slug });
            await checkAuth(); // Refresh user data to update context
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Failed to update slug:', err);
            // Handle 409 Conflict cleanly
            if (err.response?.status === 409) {
                setError('This link is already taken.');
                setIsAvailable(false);
            } else {
                setError(err.response?.data?.detail || 'Failed to update link.');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const previewUrl = `yoursite.com/${slug || 'your-link'}`;
    const showSuccess = isAvailable === true && !isChecking && slug.length >= 3;

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
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Box sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            borderRadius: '50%',
                            bgcolor: 'secondary.main',
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
                        color={showSuccess ? 'success' : 'primary'}
                        focused={showSuccess ? true : undefined}
                        helperText={
                            error ||
                            (showSuccess ? <span style={{ color: muiTheme.palette.success.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle fontSize="small" sx={{ mr: 0.5 }} /> Available</span> : 'Lowercase letters, numbers, hyphens only')
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography color="text.secondary">/</Typography>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {isChecking && <CircularProgress size={20} />}
                                    {!isChecking && isAvailable === false && <Cancel color="error" />}
                                    {!isChecking && showSuccess && <CheckCircle color="success" />}
                                </InputAdornment>
                            )
                        }}
                        sx={{ mb: 3 }}
                    />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleCreate}
                            disabled={!slug || isCreating || isAvailable === false}
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
                        Visitors need your TOTP code to upload
                    </Typography>
                </MotionPaper>
            </Container>
        </Box>
    );
}
