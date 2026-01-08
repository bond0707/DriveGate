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
    useColorScheme,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    Chip,
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
    DeleteForever,
    Favorite,
    Security,
    AccountCircle,
    QrCode2,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function Dashboard() {
    const router = useRouter();
    const muiTheme = useTheme();
    const { mode } = useColorScheme();
    const { user, logout, checkAuth } = useAuth();

    // UI State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [openFolderDialog, setOpenFolderDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // Folder Update State
    const [folderName, setFolderName] = useState('');
    const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);
    const [folderError, setFolderError] = useState('');

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // Sync state with user data
    useEffect(() => {
        if (user) {
            setFolderName(user.folder_name || '');
        }
    }, [user]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const handleDeleteAccount = () => {
        handleClose();
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        setDeleteDialogOpen(false);
        // TODO: Implement actual API call for account deletion if needed
        // For now, just logout
        logout();
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

    if (!user) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

    const uploadLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/${user.url_slug || 'setup-link'}`;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
            <Paper position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', borderRadius: 0 }}>
                <Container maxWidth="lg">
                    <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: { xs: 0 } }}>
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
                    </Box>
                </Container>
            </Paper>

            <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 6 }, mb: 4, px: { xs: 2, sm: 3 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: `linear-gradient(45deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Dashboard
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
                        Welcome back, {user.username || 'User'}
                    </Typography>
                </motion.div>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
                    {/* TOTP Status Card */}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
                                    <Typography variant="subtitle1" fontWeight={600}>Two-Factor Auth</Typography>
                                </Box>
                                <Chip
                                    icon={user.totp_secret ? <CheckCircle sx={{ fontSize: 12 }} /> : <Warning sx={{ fontSize: 12 }} />}
                                    label={user.totp_secret ? "Enabled" : "Not Setup"}
                                    color={user.totp_secret ? "success" : "warning"}
                                    size="small"
                                    sx={{ fontWeight: 600, height: 24, '& .MuiChip-label': { px: 1 } }}
                                />
                            </Box>

                            <Typography color="text.secondary" paragraph sx={{ flex: 1 }}>
                                {user.totp_secret
                                    ? "Your account is secured with TOTP. Visitors must enter a code to upload files."
                                    : "Secure your upload link by enabling Two-Factor Authentication."}
                            </Typography>

                            <Button
                                variant={user.totp_secret ? "outlined" : "contained"}
                                fullWidth
                                onClick={() => router.push('/totp-setup')}
                                startIcon={user.totp_secret ? <Refresh /> : <QrCode2 />}
                            >
                                {user.totp_secret ? "Reset TOTP" : "Setup 2FA"}
                            </Button>
                        </MotionPaper>
                    </motion.div>

                    {/* Upload Link Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CloudUpload color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight={600}>Your Upload Link</Typography>
                            </Box>

                            <Box sx={{
                                bgcolor: 'action.hover',
                                p: 2,
                                borderRadius: 2,
                                mb: 2,
                                fontFamily: 'monospace',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                wordBreak: 'break-all',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                            }}>
                                <Typography noWrap>
                                    .../{user.url_slug || 'setup-link'}
                                </Typography>
                                <Tooltip title={copiedLink ? "Copied!" : "Copy Link"} arrow>
                                    <IconButton size="small" onClick={handleCopyLink}>
                                        {copiedLink ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box sx={{ mt: 'auto' }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Edit />}
                                    onClick={() => router.push('/setup-link')}
                                >
                                    Customize Link
                                </Button>
                            </Box>
                        </MotionPaper>
                    </motion.div>

                    {/* Folder Name Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ gridColumn: '1 / -1' }}
                    >
                        <MotionPaper
                            whileHover={{ y: -3 }}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
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
                                p: 1.5,
                                px: 2,
                                borderRadius: 2,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                wordBreak: 'break-all',
                                flex: 1,
                                width: '100%',
                                fontWeight: 500,
                            }}>
                                {folderName || 'Root Directory'}
                            </Box>

                            <Button
                                startIcon={<Edit />}
                                onClick={() => setOpenFolderDialog(true)}
                                sx={{ ml: { xs: 0, sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
                            >
                                Change
                            </Button>
                        </MotionPaper>
                    </motion.div>
                </Box>

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

                {/* Delete Account Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    PaperProps={{
                        sx: { borderRadius: 3, maxWidth: 400 }
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
                    <DialogContent sx={{ pb: 3 }}>
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

            </Container>
        </Box>
    );
}
