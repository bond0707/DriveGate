'use client';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    Tooltip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import {
    ContentCopy,
    Refresh,
    Warning,
    CheckCircle,
    CloudUpload,
    Settings,
    Logout,
    Folder,
    Edit,
    Save,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function Dashboard() {
    const router = useRouter();
    const muiTheme = useTheme();
    const { user, logout, checkAuth } = useAuth();
    const [copiedLink, setCopiedLink] = useState(false);
    const [openFolderDialog, setOpenFolderDialog] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);
    const [folderError, setFolderError] = useState('');

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
        if (user) {
            setFolderName(user.folder_name || '');
        }
    }, [user]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/${user?.url_slug || ''}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleUpdateFolder = async () => {
        if (!folderName.trim()) {
            setFolderError('Folder name cannot be empty');
            return;
        }

        setIsUpdatingFolder(true);
        setFolderError('');

        try {
            await api.post('/auth/me/update-drive-folder', {
                folder_name: folderName,
                drive_type: 'GOOGLE_DRIVE'
            });
            await checkAuth(); // Refresh user data to update context
            setOpenFolderDialog(false);
        } catch (err: any) {
            console.error('Failed to update folder:', err);
            setFolderError(err.response?.data?.detail || 'Failed to update folder');
        } finally {
            setIsUpdatingFolder(false);
        }
    };

    if (!user) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

    const uploadLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${user.url_slug || 'setup-link'}`;

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: { xs: 2, md: 4 },
        }}>
            <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
                <ThemeToggle />
                <Button
                    color="inherit"
                    startIcon={<Logout />}
                    onClick={logout}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                >
                    Logout
                </Button>
            </Box>

            <Container maxWidth="lg">
                <MotionBox
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ mb: 6, mt: 4 }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Dashboard
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Welcome back, {user.username}
                    </Typography>
                </MotionBox>

                <Grid container spacing={3}>
                    {/* Upload Link Card */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            elevation={0}
                            sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CloudUpload color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight={600}>Your Upload Link</Typography>
                            </Box>

                            <Typography color="text.secondary" paragraph>
                                Share this link to receive files securely.
                            </Typography>

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    bgcolor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                    mb: 2,
                                    cursor: 'pointer'
                                }}
                                onClick={handleCopyLink}
                            >
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                    {uploadLink}
                                </Typography>
                                <Tooltip title={copiedLink ? "Copied!" : "Copy Link"} arrow>
                                    <IconButton size="small" edge="end">
                                        {copiedLink ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Paper>

                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<Settings />}
                                onClick={() => router.push('/setup-link')}
                            >
                                Customize Link
                            </Button>
                        </MotionPaper>
                    </Grid>

                    {/* TOTP Status Card */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            elevation={0}
                            sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Warning color={user.totp_secret ? "success" : "warning"} sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight={600}>Authentication</Typography>
                            </Box>

                            <Typography color="text.secondary" paragraph>
                                {user.totp_secret
                                    ? "Two-Factor Authentication is active. Your account and uploads are secure."
                                    : "Two-Factor Authentication is NOT set up. Please set it up to enable uploads."}
                            </Typography>

                            <Button
                                variant="contained"
                                color={user.totp_secret ? "secondary" : "primary"}
                                fullWidth
                                onClick={() => router.push('/totp-setup')}
                            >
                                {user.totp_secret ? "Reset TOTP" : "Setup 2FA"}
                            </Button>
                        </MotionPaper>
                    </Grid>

                    {/* Drive Folder Card */}
                    <Grid size={{ xs: 12 }}>
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            elevation={0}
                            sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Folder color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" fontWeight={600}>Google Drive Folder</Typography>
                                </Box>
                                <Button
                                    startIcon={<Edit />}
                                    size="small"
                                    onClick={() => setOpenFolderDialog(true)}
                                >
                                    Change Folder
                                </Button>
                            </Box>

                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Current Upload Folder
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user.folder_name || 'Not Configured (Files will go to Root)'}
                                </Typography>
                                {user.folder_id && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                        ID: {user.folder_id}
                                    </Typography>
                                )}
                            </Box>
                        </MotionPaper>
                    </Grid>
                </Grid>

                {/* Update Folder Dialog */}
                <Dialog
                    open={openFolderDialog}
                    onClose={() => !isUpdatingFolder && setOpenFolderDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Update Drive Folder</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Enter the name of the folder where uploads should be saved.
                            This will create a new folder in your Google Drive if it doesn't exist.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Folder Name"
                            fullWidth
                            variant="outlined"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={isUpdatingFolder}
                            error={!!folderError}
                            helperText={folderError}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenFolderDialog(false)} disabled={isUpdatingFolder}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateFolder}
                            variant="contained"
                            disabled={isUpdatingFolder}
                            startIcon={isUpdatingFolder ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        >
                            {isUpdatingFolder ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
