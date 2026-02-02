'use client';
import {
    Box,
    Container,
    Typography,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Button,
    Snackbar,
    CircularProgress,
    Tooltip,
    useTheme,
    useColorScheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from '@mui/material';
import {
    CloudUpload,
    Security,
    Logout,
    AccountCircle,
    Link as LinkIcon,
    ContentCopy,
    Edit,
    Refresh,
    Folder,
    Warning,
    DeleteForever,
    Favorite,
    QrCode2,
    OpenInNew,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import * as OTPAuth from 'otpauth';

const MotionPaper = motion.create(Paper);

export default function DashboardClient() {
    const router = useRouter();
    const theme = useTheme();
    const { mode } = useColorScheme();
    const { user, signOut, checkAuth, isLoading: authLoading } = useAuth();

    // UI States
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Setup Pipeline State - prevents dashboard from showing before setup is complete
    const [setupComplete, setSetupComplete] = useState(false);

    // Real TOTP States (fetched from backend)
    const [totpCode, setTotpCode] = useState<string | null>(null);
    const [totpProgress, setTotpProgress] = useState(100);
    const [totpLoading, setTotpLoading] = useState(true);

    // Delete Account State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false);
    const [, setIsDeleting] = useState(false);
    const [deletedUsername, setDeletedUsername] = useState<string>('');

    // Sign Out Confirmation State
    const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

    // Profile Picture Retry State
    const [pfpRetryCount, setPfpRetryCount] = useState(0);
    const [pfpKey, setPfpKey] = useState(0); // Key to force re-render of Avatar
    const MAX_PFP_RETRIES = 3;

    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // ---------------------------------------------------------
    // 1. THE SETUP PIPELINE (TOTP -> SLUG -> FOLDER)
    // ---------------------------------------------------------
    useEffect(() => {
        const runSetupPipeline = async () => {
            // Wait for auth to load
            if (authLoading) return;

            // If not logged in, go to login
            if (!user) {
                router.push('/login');
                return;
            }

            // --- STEP 1: TOTP ---
            if (!user.totp_secret) {
                // Check if we are returning from a "Reset Cancel" action
                const skipTotp = localStorage.getItem('skip_totp_setup');

                if (skipTotp) {
                    // User canceled reset. Clean flag. 
                    // In real app, we might want to ensure they actually have a secret, 
                    // but for now we respect the skip flag to avoid loop.
                    localStorage.removeItem('skip_totp_setup');
                } else {
                    // Redirect to Setup
                    router.push('/setup-totp');
                    return;
                }
            }

            // --- STEP 2: FOLDER NAME ---
            if (!user.folder_name) {
                const skipSetup = localStorage.getItem('skip_folder_setup');

                if (skipSetup) {
                    // If user skipped/canceled folder setup, auto-set default via API
                    localStorage.removeItem('skip_folder_setup');
                    try {
                        await api.post('/auth/me/update-drive-folder', {
                            folder_name: 'DriveGate Uploads',
                            drive_type: 'GOOGLE_DRIVE'
                        });
                        await checkAuth(); // Refresh user state
                    } catch (e) {
                        console.error("Failed to set default folder", e);
                    }
                } else {
                    // Redirect to Setup
                    router.push('/setup-folder');
                    return;
                }
            }

            // --- STEP 3: UPLOAD LINK (SLUG) ---
            if (!user.url_slug) {
                router.push('/setup-link');
                return;
            }

            // All setup steps passed - mark setup as complete
            setSetupComplete(true);
        };

        runSetupPipeline();
    }, [user, authLoading, router, checkAuth]);

    // 2. Calculate TOTP Code Locally (no backend calls needed)
    useEffect(() => {
        if (!setupComplete || !user?.totp_secret) {
            setTotpLoading(false);
            return;
        }

        const calculateTotp = () => {
            try {
                const totp = new OTPAuth.TOTP({
                    issuer: 'DriveGate',
                    label: user.email,
                    algorithm: 'SHA1',
                    digits: 6,
                    period: 30,
                    secret: user.totp_secret!, // Non-null assertion - we already checked above
                });

                const code = totp.generate();
                setTotpCode(code);

                // Calculate remaining seconds in current period
                const now = Math.floor(Date.now() / 1000);
                const remainingSeconds = 30 - (now % 30);
                setTotpProgress(remainingSeconds * (100 / 30));
            } catch (err) {
                console.error('Failed to calculate TOTP:', err);
                setTotpCode(null);
            } finally {
                setTotpLoading(false);
            }
        };

        // Calculate immediately
        calculateTotp();

        // Then update every second
        const interval = setInterval(calculateTotp, 1000);
        return () => clearInterval(interval);
    }, [setupComplete, user?.totp_secret, user?.email]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        handleClose();
        setSignOutDialogOpen(true);
    };

    const handleConfirmSignOut = () => {
        setSignOutDialogOpen(false);
        signOut();
    };

    // --- Delete Account Handlers ---
    const handleDeleteAccount = () => {
        handleClose();
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        // Store the username before deleting for the goodbye message
        const usernameToDelete = user?.username || '';
        try {
            await api.delete('/auth/me');
            setDeletedUsername(usernameToDelete);
            setDeleteDialogOpen(false);
            setThankYouDialogOpen(true);
            setTimeout(() => {
                signOut();
            }, 3000);
        } catch (error) {
            console.error("Error deleting account:", error);
            setDeleteDialogOpen(false);
            setSnackbarMessage("Failed to delete account");
            setSnackbarOpen(true);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopyLink = () => {
        if (!user?.url_slug) return;
        const fullUrl = `${window.location.origin}/${user.url_slug}`;
        navigator.clipboard.writeText(fullUrl);
        setSnackbarMessage('Link copied!');
        setSnackbarOpen(true);
    };

    const handleCopyTotp = () => {
        if (!totpCode) return;
        navigator.clipboard.writeText(totpCode);
        setSnackbarMessage('Code copied!');
        setSnackbarOpen(true);
    };

    const handleRescanTotp = () => {
        localStorage.setItem('totp_mode', 'rescan');
        router.push('/setup-totp');
    };

    const handleResetTotp = () => {
        localStorage.setItem('totp_mode', 'reset');
        router.push('/setup-totp');
    };

    const handleUpdateFolder = () => {
        localStorage.setItem('folder_mode', 'update');
        router.push('/setup-folder');
    };

    // Loading State - wait for both auth AND setup pipeline to complete
    if (authLoading || !user || !setupComplete) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                flexDirection: 'column',
                gap: 3,
            }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

    // Derived States
    const isTotpEnabled = !!user.totp_secret;
    const uploadLink = user.url_slug;
    const isLinkSetup = !!uploadLink;

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
                        <Avatar
                            key={pfpKey}
                            src={pfpRetryCount >= MAX_PFP_RETRIES
                                ? undefined
                                : user.picture_url
                                    ? `${user.picture_url}${pfpRetryCount > 0 ? `${user.picture_url.includes('?') ? '&' : '?'}retry=${pfpRetryCount}` : ''}`
                                    : undefined
                            }
                            sx={{ width: 32, height: 32, bgcolor: 'transparent', border: '2px solid', borderColor: 'primary.main' }}
                            slotProps={{
                                img: {
                                    referrerPolicy: 'no-referrer',
                                    onError: () => {
                                        if (pfpRetryCount < MAX_PFP_RETRIES) {
                                            // Retry loading after a short delay
                                            setTimeout(() => {
                                                setPfpRetryCount(prev => prev + 1);
                                                setPfpKey(prev => prev + 1);
                                            }, 1000);
                                        }
                                    }
                                }
                            }}
                        >
                            <AccountCircle sx={{ color: 'primary.main', fontSize: 28 }} />
                        </Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleSignOut}>
                            <Logout sx={{ mr: 1 }} fontSize="small" />
                            Sign Out
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
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Hello, {user.username?.split(' ')[0]}
                    </Typography>
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
                                        bgcolor: '#00897B',
                                        color: 'white',
                                        display: 'flex'
                                    }}>
                                        <Security sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight={600}>Time based OTP</Typography>
                                </Box>
                            </Box>

                            {/* TOTP Code Display */}
                            {totpLoading ? (
                                <Box
                                    sx={{
                                        bgcolor: 'action.hover',
                                        p: 2,
                                        borderRadius: 2,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: 1,
                                        minHeight: 60,
                                    }}
                                >
                                    <SquircleLoader size={30} color={loaderColor} />
                                </Box>
                            ) : totpCode ? (
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
                            ) : (
                                <Box
                                    sx={{
                                        bgcolor: 'action.hover',
                                        p: 2,
                                        borderRadius: 2,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flex: 1,
                                        minHeight: 60,
                                    }}
                                >
                                    <Typography color="text.secondary" variant="body2">
                                        {isTotpEnabled ? 'Unable to load code' : 'TOTP not configured'}
                                    </Typography>
                                </Box>
                            )}

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

                    {/* Upload Link Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
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
                                    bgcolor: '#5C6BC0',
                                    color: 'white',
                                    display: 'flex'
                                }}>
                                    <LinkIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>Upload Link</Typography>
                            </Box>

                            {isLinkSetup ? (
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
                            ) : (
                                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <Typography color="text.secondary" variant="body2">No link configured</Typography>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 100, p: 0.5, gap: 0.5 }}>
                                    <Button
                                        size="small"
                                        startIcon={<ContentCopy sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                        onClick={handleCopyLink}
                                        disabled={!isLinkSetup}
                                        sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Copy
                                    </Button>
                                    <Button
                                        size="small"
                                        startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                        onClick={() => router.push('/setup-link')}
                                        sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        {isLinkSetup ? "Change" : "Setup"}
                                    </Button>
                                </Box>
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
                                {user.folder_name || 'My Drive (Root)'}
                            </Box>
                            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 100, p: 0.5, gap: 0.5 }}>
                                <Tooltip title="Open folder in Google Drive" arrow>
                                    <Button
                                        size="small"
                                        startIcon={<OpenInNew sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                        onClick={() => {
                                            // Open folder directly in Google Drive using folder ID
                                            if (user.folder_id) {
                                                const driveUrl = `https://drive.google.com/drive/folders/${user.folder_id}?authuser=${encodeURIComponent(user.email)}`;
                                                window.open(driveUrl, '_blank');
                                            } else {
                                                // Fallback to search if no folder ID
                                                const folderName = user.folder_name || 'DriveGate Uploads';
                                                window.open(`https://drive.google.com/drive/search?q=${encodeURIComponent(folderName)}`, '_blank');
                                            }
                                        }}
                                        sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Open
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Change upload folder name" arrow>
                                    <Button
                                        size="small"
                                        startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                        onClick={handleUpdateFolder}
                                        sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                    >
                                        Change
                                    </Button>
                                </Tooltip>
                            </Box>
                        </MotionPaper>
                    </motion.div>
                </Box>

                {/* Upload Files Banner (Only shows if configured) */}
                {
                    isLinkSetup && isTotpEnabled && (
                        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <MotionPaper
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => router.push(`/${uploadLink}`)}
                                    sx={{
                                        p: { xs: 3, sm: 4 },
                                        background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                                        <CloudUpload sx={{ fontSize: { xs: 36, sm: 48 } }} />
                                        <Box>
                                            <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                Upload Files
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                Visit your public upload page
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MotionPaper>
                            </motion.div>
                        </Box>
                    )
                }
            </Container >

            {/* Delete Account Dialog */}
            < Dialog
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
                <DialogContent sx={{ pb: 3, px: 3 }}>
                    <Typography color="text.secondary">
                        All your TOTP secrets and Drive data will be deleted <strong>instantly and permanently</strong>. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                    >
                        Delete Account
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Sign Out Confirmation Dialog */}
            <Dialog
                open={signOutDialogOpen}
                onClose={() => setSignOutDialogOpen(false)}
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
                        bgcolor: '#E3F2FD',
                        color: '#1565C0',
                        display: 'flex'
                    }}>
                        <Logout />
                    </Box>
                    Sign Out?
                </DialogTitle>
                <DialogContent sx={{ pb: 3, px: 3 }}>
                    <Typography color="text.secondary">
                        Are you sure you want to sign out? You'll need to sign in again to access your dashboard.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                        variant="contained"
                        onClick={handleConfirmSignOut}
                        sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                    >
                        Sign Out
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setSignOutDialogOpen(false)}
                        sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Thank You Dialog */}
            < Dialog
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
                        bgcolor: '#FFEBEE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}>
                        <Favorite sx={{ fontSize: 32, color: '#E53935' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Thanks for using DriveGate{deletedUsername ? `, ${deletedUsername.split(' ')[0]}` : ''}!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        We&apos;re sad to see you go. Your account has been deleted.
                    </Typography>
                </DialogContent>
            </Dialog >

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box >
    );
}