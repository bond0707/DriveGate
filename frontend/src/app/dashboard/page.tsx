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
<<<<<<< HEAD
    CircularProgress,
    InputAdornment,
=======
    useColorScheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
} from '@mui/material';
import {
    ContentCopy,
    Refresh,
    Warning,
    CheckCircle,
<<<<<<< HEAD
    CloudUpload,
    Settings,
    Logout,
    Folder,
    Edit,
    Save,
=======
    DeleteForever,
    Folder,
    Warning,
    Favorite,
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useRouter } from 'next/navigation';
=======
import Image from 'next/image';
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function Dashboard() {
    const router = useRouter();
<<<<<<< HEAD
    const muiTheme = useTheme();
    const { user, logout, checkAuth } = useAuth();
    const [copiedLink, setCopiedLink] = useState(false);
    const [openFolderDialog, setOpenFolderDialog] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);
    const [folderError, setFolderError] = useState('');
=======
    const theme = useTheme();
    const { mode } = useColorScheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totpEnabled, setTotpEnabled] = useState(false);
    const [uploadLink, setUploadLink] = useState<string | null>(null);
    const [folderName, setFolderName] = useState<string | null>(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [totpCode, setTotpCode] = useState(generateMockTotp());
    const [totpProgress, setTotpProgress] = useState(100);
    const [userName] = useState('User');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false);
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
<<<<<<< HEAD
        if (user) {
            setFolderName(user.folder_name || '');
        }
    }, [user]);
=======
        const interval = setInterval(() => {
            setTotpProgress(prev => {
                if (prev <= 0) {
                    setTotpCode(generateMockTotp());
                    return 100;
                }
                return prev - (100 / 30);
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));

            const isTotpSetup = localStorage.getItem('totp_enabled') === 'true';
            const link = localStorage.getItem('upload_link');


            if (!isTotpSetup) {
                // Check if we're skipping setup (coming back from reset)
                const skipTotp = localStorage.getItem('skip_totp_setup');
                if (skipTotp) {
                    localStorage.removeItem('skip_totp_setup');
                    localStorage.setItem('totp_enabled', 'true');
                } else {
                    router.push('/setup-totp');
                    return;
                }
            }

            if (!link) {
                router.push('/setup-link');
                return;
            }

            const folder = localStorage.getItem('folder_name');
            if (!folder) {
                // If coming from a cancel action (skip_setup flag), just use default
                const skipSetup = localStorage.getItem('skip_folder_setup');
                if (skipSetup) {
                    localStorage.removeItem('skip_folder_setup');
                    localStorage.setItem('folder_name', 'DriveGate Uploads');
                } else {
                    router.push('/setup-folder');
                    return;
                }
            }

            setTotpEnabled(true);
            setUploadLink(link);
            setFolderName(localStorage.getItem('folder_name') || 'DriveGate Uploads');
            setIsLoading(false);
        };

        checkStatus();
    }, [router]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        router.push('/login');
    };
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497

    const handleDeleteAccount = () => {
        handleClose();
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        setDeleteDialogOpen(false);
        // Clear all user data
        localStorage.removeItem('totp_enabled');
        localStorage.removeItem('upload_link');
        localStorage.removeItem('folder_name');
        localStorage.removeItem('totp_mode');
        localStorage.removeItem('link_mode');
        // Show thank you message
        setThankYouDialogOpen(true);
        // Auto redirect after 3 seconds
        setTimeout(() => {
            router.push('/login');
        }, 3000);
    };

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

<<<<<<< HEAD
    if (!user) {
=======
    const handleResetTotp = () => {
        localStorage.removeItem('totp_enabled');
        localStorage.setItem('totp_mode', 'reset');
        router.push('/setup-totp');
    };

    const handleRescanTotp = () => {
        localStorage.setItem('totp_mode', 'rescan');
        router.push('/setup-totp');
    };

    if (isLoading) {
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

<<<<<<< HEAD
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
=======
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                    <Image src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="DriveGate" width={28} height={28} style={{ marginRight: 12 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        DriveGate
                    </Typography>
                    <ThemeToggle />
                    <IconButton size="small" onClick={handleMenu} sx={{ ml: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent', border: '2px solid #0D9488' }}>
                            <AccountCircle sx={{ color: '#0D9488' }} />
                        </Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} fontSize="small" />
                            Logout
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleDeleteAccount} sx={{ color: 'error.main' }}>
                            <DeleteForever sx={{ mr: 1 }} fontSize="small" />
                            Delete Account
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 6 }, mb: 4, px: { xs: 2, sm: 3 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ mb: 6, mt: 4 }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Dashboard
                    </Typography>
<<<<<<< HEAD
                    <Typography variant="h6" color="text.secondary">
                        Welcome back, {user.username}
                    </Typography>
                </MotionBox>
=======
                </motion.div>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3 }, mt: { xs: 3, sm: 4 } }}>
                    {/* TOTP Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <MotionPaper
                            whileHover={{ y: -3 }}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        bgcolor: '#0D9488',
                                        color: 'white',
                                        display: 'flex'
                                    }}>
                                        <Security sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight={600}>Time based OTP</Typography>
                                </Box>
                                <Chip
                                    icon={<CheckCircle sx={{ fontSize: 12 }} />}
                                    label="Enabled"
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 600, height: 24, '& .MuiChip-label': { px: 1 } }}
                                />
                            </Box>

                            <Tooltip title="Click to copy" arrow>
                                <Box
                                    onClick={handleCopyTotp}
                                    sx={{
                                        bgcolor: 'action.hover',
                                        p: 2,
                                        borderRadius: 2,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flex: 1,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: 'action.selected' },
                                        minHeight: 60,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                            fontWeight: 700,
                                            letterSpacing: '0.15em',
                                            color: 'primary.main',
                                        }}
                                    >
                                        {totpCode.slice(0, 3)} {totpCode.slice(3)}
                                    </Typography>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={totpProgress}
                                            size={28}
                                            thickness={4}
                                            color="primary"
                                        />
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, bottom: 0, right: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: 10 }}>
                                                {Math.round(totpProgress / (100 / 30))}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Tooltip>

                            <Box sx={{
                                display: 'flex',
                                bgcolor: 'action.hover',
                                borderRadius: 100,
                                p: 0.5,
                                gap: 0.5,
                            }}>
                                <Tooltip title="Add existing code to new authenticator" arrow>
                                    <Button
                                        size="small"
                                        startIcon={<QrCode2 sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                        onClick={handleRescanTotp}
                                        sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Rescan
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Generate new code (old codes stop working)" arrow>
                                    <Button
                                        size="small"
                                        startIcon={<Refresh sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                        onClick={handleResetTotp}
                                        sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Reset
                                    </Button>
                                </Tooltip>
                            </Box>
                        </MotionPaper>
                    </motion.div>
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497

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
<<<<<<< HEAD

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
=======
                            <Box sx={{
                                bgcolor: 'action.hover',
                                p: 2,
                                borderRadius: 2,
                                mb: 2,
                                fontFamily: 'monospace',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                wordBreak: 'break-all',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                minHeight: 60,
                            }}>
                                /{uploadLink}
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                bgcolor: 'action.hover',
                                borderRadius: 100,
                                p: 0.5,
                                gap: 0.5,
                            }}>
                                <Button
                                    size="small"
                                    startIcon={<ContentCopy sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    onClick={handleCopyLink}
                                    sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    Copy
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    onClick={() => {
                                        localStorage.setItem('link_mode', 'update');
                                        router.push('/setup-link');
                                    }}
                                    sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    Change
                                </Button>
                            </Box>
                        </MotionPaper>
                    </motion.div>

                    {/* Folder Name Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <MotionPaper
                            whileHover={{ y: -3 }}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: '#F59E0B',
                                    color: 'white',
                                    display: 'flex'
                                }}>
                                    <Folder sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>Upload Folder</Typography>
                            </Box>
                            <Box sx={{
                                bgcolor: 'action.hover',
                                p: 2,
                                borderRadius: 2,
                                mb: 2,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                wordBreak: 'break-all',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                minHeight: 60,
                                fontWeight: 500,
                            }}>
                                {folderName}
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                bgcolor: 'action.hover',
                                borderRadius: 100,
                                p: 0.5,
                                gap: 0.5,
                            }}>
                                <Button
                                    size="small"
                                    startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                    onClick={() => {
                                        localStorage.setItem('folder_mode', 'update');
                                        router.push('/setup-folder');
                                    }}
                                    sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    Change
                                </Button>
                            </Box>
                        </MotionPaper>
                    </motion.div>
                </Box>

                {/* Upload Files Card */}
                <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
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
<<<<<<< HEAD
=======

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            maxWidth: 400,
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: '#FFF3E0',
                        color: '#E65100',
                        display: 'flex'
                    }}>
                        <Warning />
                    </Box>
                    Delete Account?
                </DialogTitle>
                <DialogContent sx={{ pb: 3, align: "center" }}>
                    <Typography color="text.secondary">
                        All your TOTP secrets and Drive data will be deleted <strong>instantly and permanently</strong>. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ borderRadius: 2, flex: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        sx={{ borderRadius: 2, flex: 1 }}
                    >
                        Delete Account
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Thank You Dialog */}
            <Dialog
                open={thankYouDialogOpen}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 3,
                            maxWidth: 400,
                            textAlign: 'center',
                        }
                    }
                }}
            >
                <DialogContent sx={{ py: 4, px: 3 }}>
                    <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}>
                        <Favorite sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Thanks for using DriveGate!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        We are sad to see you go. Your account has been deleted.
                    </Typography>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
>>>>>>> 88b72a337aae47ff259cf284b059061b51848497
        </Box>
    );
}
