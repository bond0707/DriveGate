'use client';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    Folder,
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

export default function SetupFolderPage() {
    const router = useRouter();
    const muiTheme = useTheme();
    const { user, checkAuth } = useAuth();
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
        const mode = localStorage.getItem('folder_mode');
        const isUpdateMode = mode === 'update';
        setIsUpdate(isUpdateMode);

        // Pre-fill with current folder name from user context
        if (user?.folder_name) {
            setFolderName(user.folder_name);
        }
    }, [user]);

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            localStorage.removeItem('folder_mode');
            localStorage.setItem('skip_folder_setup', 'true');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleClose = () => {
        localStorage.removeItem('folder_mode');
        // Set flag to tell dashboard to skip folder setup redirect
        localStorage.setItem('skip_folder_setup', 'true');
        router.push('/dashboard');
    };

    const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFolderName(value);
        setError('');
    };

    const handleCreate = async () => {
        if (folderName.trim().length < 3) {
            setError('Folder name must be at least 3 characters');
            return;
        }
        if (folderName.length > 50) {
            setError('Folder name must be 50 characters or less');
            return;
        }

        // Check if name actually changed (only for updates)
        if (isUpdate && folderName.trim() === user?.folder_name) {
            setError("That's already your current folder name");
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            await api.post('/auth/me/update-drive-folder', {
                folder_name: folderName.trim(),
                drive_type: 'GOOGLE_DRIVE'
            });
            await checkAuth(); // Refresh user context
            localStorage.removeItem('folder_mode');
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Failed to create folder:', err);
            setError(err.response?.data?.detail || 'Failed to create folder. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

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
                            bgcolor: '#F59E0B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                        }}>
                            <Folder sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                        </Box>
                    </MotionBox>

                    <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
                        {isUpdate ? 'Update Folder Name' : 'Create Drive Folder'}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Name the folder where uploads will be stored
                    </Typography>

                    <TextField
                        fullWidth
                        value={folderName}
                        onChange={handleFolderNameChange}
                        placeholder="DriveGate Uploads"
                        error={!!error}
                        helperText={error || 'This folder will be created in your Google Drive'}
                        sx={{ mb: 3 }}
                    />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleCreate}
                            disabled={!folderName.trim() || isCreating}
                            endIcon={isCreating ? <SquircleLoader size={20} color="white" /> : <ArrowForward />}
                            sx={{ py: 1.5 }}
                        >
                            {isCreating ? 'Creating...' : isUpdate ? 'Update' : 'Create Folder'}
                        </Button>
                    </motion.div>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                        Files uploaded via your link will go here
                    </Typography>
                </MotionPaper>
            </Container>
        </Box>
    );
}
