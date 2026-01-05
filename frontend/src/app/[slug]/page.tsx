'use client';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    LinearProgress,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    CloudUpload,
    CheckCircle,
    Security,
    InsertDriveFile,
    ExpandMore,
    ExpandLess,
    Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, use, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SquircleLoader from '@/components/SquircleLoader';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

interface FileUpload {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
}

export default function PublicUploadPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const muiTheme = useTheme();
    const [step, setStep] = useState<'totp' | 'upload' | 'success'>('totp');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [files, setFiles] = useState<FileUpload[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [userName] = useState('User');
    const [showAllFiles, setShowAllFiles] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backWarningOpen, setBackWarningOpen] = useState(false);

    const loaderColor = muiTheme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // Handle back button warning during upload step
    useEffect(() => {
        if (step === 'upload') {
            // Push a dummy state to intercept back
            window.history.pushState({ uploadPage: true }, '');

            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault();
                setBackWarningOpen(true);
                // Re-push state to stay on page
                window.history.pushState({ uploadPage: true }, '');
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [step]);

    const handleConfirmLeave = () => {
        setBackWarningOpen(false);
        // Go back to start
        setStep('totp');
        setOtp(['', '', '', '', '', '']);
        setFiles([]);
        setShowAllFiles(false);
    };

    // Silent auto-refresh after 5 seconds
    useEffect(() => {
        if (step === 'success') {
            const timer = setTimeout(() => {
                setStep('totp');
                setOtp(['', '', '', '', '', '']);
                setFiles([]);
                setShowAllFiles(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Auto-focus first box when on totp step
    useEffect(() => {
        if (step === 'totp') {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [step]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        // Only allow input if all previous boxes are filled
        if (value && index > 0) {
            const allPreviousFilled = otp.slice(0, index).every(d => d !== '');
            if (!allPreviousFilled) return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Delay focus to allow React to re-render and enable the next box
        if (value && index < 5) {
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
        }

        if (newOtp.every(d => d !== '')) {
            verifyTotp(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleFocus = (index: number) => {
        // Find the first empty box
        const firstEmptyIndex = otp.findIndex(d => d === '');
        // If clicking on a box beyond the first empty, redirect focus
        if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
            inputRefs.current[firstEmptyIndex]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        if (newOtp.every(d => d !== '')) {
            verifyTotp(newOtp.join(''));
        }
    };

    const verifyTotp = async (code: string) => {
        setIsVerifying(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (code.length === 6) {
            setStep('upload');
        } else {
            setError('Invalid code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
        setIsVerifying(false);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const fileUploads: FileUpload[] = newFiles.map(file => ({
            file,
            progress: 0,
            status: 'pending' as const,
        }));
        setFiles(prev => [...prev, ...fileUploads]);
    };

    const handleUpload = async () => {
        for (let i = 0; i < files.length; i++) {
            if (files[i].status !== 'pending') continue;

            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'uploading' as const } : f
            ));

            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, progress } : f
                ));
            }

            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'done' as const } : f
            ));
        }
        setStep('success');
    };

    const hasFiles = files.length > 0;
    const visibleFiles = showAllFiles ? files : files.slice(0, 3);
    const hiddenCount = files.length - 3;

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
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <ThemeToggle />
            </Box>

            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
                <AnimatePresence mode="wait">
                    {step === 'totp' && (
                        <MotionPaper
                            key="totp-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 5 },
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <AnimatePresence>
                                {isVerifying && (
                                    <MotionBox
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            gap: 2,
                                            zIndex: 10,
                                            bgcolor: 'background.paper',
                                            opacity: 0.97,
                                        }}
                                    >
                                        <SquircleLoader size={50} color={loaderColor} />
                                        <Typography color="text.secondary">Verifying...</Typography>
                                    </MotionBox>
                                )}
                            </AnimatePresence>

                            <MotionBox
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Box sx={{
                                    width: { xs: 60, sm: 80 },
                                    height: { xs: 60, sm: 80 },
                                    borderRadius: '50%',
                                    bgcolor: '#0D9488',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}>
                                    <Security sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                                </Box>
                            </MotionBox>

                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
                                Secure Upload
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Enter the 6-digit code to continue
                            </Typography>

                            <Box
                                sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', mb: 2 }}
                                onPaste={handlePaste}
                            >
                                {otp.map((digit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                    >
                                        <TextField
                                            inputRef={(el) => (inputRefs.current[index] = el)}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            disabled={isVerifying || (index > 0 && otp.slice(0, index).some(d => d === ''))}
                                            inputProps={{
                                                maxLength: 1,
                                                style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 600 },
                                            }}
                                            sx={{ width: { xs: 42, sm: 50 } }}
                                            error={!!error}
                                        />
                                    </motion.div>
                                ))}
                            </Box>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Typography color="error" sx={{ fontSize: '0.875rem' }}>{error}</Typography>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </MotionPaper>
                    )}

                    {step === 'upload' && (
                        <MotionPaper
                            key="upload-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 5 },
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1, textAlign: 'center' }}>
                                Hello, {userName}!
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Drop files below to upload
                            </Typography>

                            <Box
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: isDragging ? 'primary.main' : 'divider',
                                    borderRadius: 3,
                                    p: { xs: 4, sm: 6 },
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: isDragging ? 'action.hover' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    mb: 3,
                                }}
                            >
                                <CloudUpload sx={{ fontSize: { xs: 36, sm: 48 }, color: 'primary.main', mb: 1 }} />
                                <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                    {isDragging ? 'Drop files here' : 'Drag & drop files'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    or click to browse
                                </Typography>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    hidden
                                    onChange={handleFileSelect}
                                />
                            </Box>

                            {files.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    {visibleFiles.map((f, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                p: 1.5,
                                                mb: 1,
                                                bgcolor: 'action.hover',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <InsertDriveFile color="primary" sx={{ fontSize: 20 }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography noWrap sx={{ fontSize: '0.875rem' }}>{f.file.name}</Typography>
                                                {f.status === 'uploading' && (
                                                    <LinearProgress variant="determinate" value={f.progress} sx={{ mt: 0.5 }} />
                                                )}
                                            </Box>
                                            {f.status === 'done' && <CheckCircle color="success" sx={{ fontSize: 20 }} />}
                                        </Box>
                                    ))}

                                    {files.length > 3 && (
                                        <Button
                                            size="small"
                                            onClick={() => setShowAllFiles(!showAllFiles)}
                                            endIcon={showAllFiles ? <ExpandLess /> : <ExpandMore />}
                                            sx={{ mt: 0.5 }}
                                        >
                                            {showAllFiles ? 'Show less' : `+ ${hiddenCount} more`}
                                        </Button>
                                    )}
                                </Box>
                            )}

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleUpload}
                                    disabled={!hasFiles || files.some(f => f.status === 'uploading')}
                                    startIcon={<CloudUpload />}
                                    sx={{ py: 1.5 }}
                                >
                                    Upload {files.length || ''} file{files.length !== 1 ? 's' : ''}
                                </Button>
                            </motion.div>
                        </MotionPaper>
                    )}

                    {step === 'success' && (
                        <MotionPaper
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: 'spring' }}
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
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}>
                                    <CheckCircle sx={{ fontSize: { xs: 48, sm: 60 }, color: 'white' }} />
                                </Box>
                            </MotionBox>

                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                                Upload Complete!
                            </Typography>
                            <Typography color="text.secondary">
                                {files.length} file{files.length !== 1 ? 's' : ''} uploaded successfully.
                            </Typography>
                        </MotionPaper>
                    )}
                </AnimatePresence>
            </Container>

            {/* Back Warning Dialog */}
            <Dialog
                open={backWarningOpen}
                onClose={() => setBackWarningOpen(false)}
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
                    Leaving this page?
                </DialogTitle>
                <DialogContent sx={{ pb: 3 }}>
                    <Typography color="text.secondary">
                        You&apos;ll need to re-enter your TOTP code and any selected files and upload progress will be lost.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setBackWarningOpen(false)}
                        sx={{ borderRadius: 2, flex: 1 }}
                    >
                        Stay
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmLeave}
                        sx={{ borderRadius: 2, flex: 1 }}
                    >
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
