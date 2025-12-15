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
    Chip,
    CircularProgress,
    Tooltip,
    useTheme,
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
    QrCode2,
    CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';

const MotionPaper = motion.create(Paper);

function generateMockTotp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function DashboardPage() {
    const router = useRouter();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totpEnabled, setTotpEnabled] = useState(false);
    const [uploadLink, setUploadLink] = useState<string | null>(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [totpCode, setTotpCode] = useState(generateMockTotp());
    const [totpProgress, setTotpProgress] = useState(100);
    const [userName] = useState('User');

    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    useEffect(() => {
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
                router.push('/totp-setup');
                return;
            }

            if (!link) {
                router.push('/setup-link');
                return;
            }

            setTotpEnabled(true);
            setUploadLink(link);
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

    const handleCopyLink = () => {
        const fullUrl = `${window.location.origin}/${uploadLink}`;
        navigator.clipboard.writeText(fullUrl);
        setSnackbarMessage('Link copied!');
        setSnackbarOpen(true);
    };

    const handleCopyTotp = () => {
        navigator.clipboard.writeText(totpCode);
        setSnackbarMessage('Code copied!');
        setSnackbarOpen(true);
    };

    const handleResetTotp = () => {
        localStorage.removeItem('totp_enabled');
        localStorage.setItem('totp_mode', 'reset');
        router.push('/totp-setup');
    };

    const handleRescanTotp = () => {
        localStorage.setItem('totp_mode', 'rescan');
        router.push('/totp-setup');
    };

    if (isLoading) {
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
                <Typography color="text.secondary">Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                    <CloudUpload sx={{ mr: 1.5, color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        TOTP Drive
                    </Typography>
                    <ThemeToggle />
                    <IconButton size="small" onClick={handleMenu} sx={{ ml: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <AccountCircle />
                        </Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} fontSize="small" />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: { xs: 3, sm: 6 }, mb: 4, px: { xs: 2, sm: 3 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Hello, {userName}
                    </Typography>
                </motion.div>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 }, mt: { xs: 3, sm: 4 } }}>
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
                                        bgcolor: 'primary.main',
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
                                    bgcolor: 'secondary.main',
                                    color: 'white',
                                    display: 'flex'
                                }}>
                                    <LinkIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>Upload Link</Typography>
                            </Box>
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
                </Box>

                {/* Upload Files Card */}
                <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
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
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    );
}
