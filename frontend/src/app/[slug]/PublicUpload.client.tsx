'use client';

import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    CloudUpload,
    CheckCircle,
    Error as ErrorIcon,
    Close,
    InsertDriveFile,
    Image as ImageIcon,
    Warning,
    Lock,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import SquircleLoader from '@/components/SquircleLoader';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

interface FileStatus {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

export default function PublicUploadClient() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const theme = useTheme();
    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // Page Loading State (checking if slug exists)
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Steps: totp -> upload -> success
    const [step, setStep] = useState<'totp' | 'upload' | 'success'>('totp');

    // TOTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Upload State
    const [uploadToken, setUploadToken] = useState<string | null>(null);
    const [files, setFiles] = useState<FileStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [backWarningOpen, setBackWarningOpen] = useState(false);

    // Rate Limit Countdown State
    const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // --- Effects ---

    // Validate slug exists on mount
    useEffect(() => {
        const validateSlug = async () => {
            try {
                // Call backend to check if this slug exists
                await api.get(`/url/validate-slug?url_slug=${slug}`);
                setIsPageLoading(false);
            } catch (err: unknown) {
                console.error('Slug validation failed:', err);
                // If slug doesn't exist (404) or any error, redirect to landing page with message
                router.replace('/?invalid_link=true');
            }
        };

        if (slug) {
            validateSlug();
        }
    }, [slug, router]);

    // Focus first input on mount
    useEffect(() => {
        if (step === 'totp' && !isPageLoading) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [step, isPageLoading]);

    // Rate limit countdown timer
    useEffect(() => {
        if (rateLimitSeconds === null || rateLimitSeconds <= 0) {
            if (rateLimitSeconds === 0) {
                // Clear error when countdown reaches 0
                setVerifyError('');
                setRateLimitSeconds(null);
            }
            return;
        }

        const timer = setInterval(() => {
            setRateLimitSeconds(prev => {
                if (prev === null || prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [rateLimitSeconds]);

    // Handle back button warning during upload
    useEffect(() => {
        if (step === 'upload' && files.length > 0) {
            // Push state to intercept back button
            window.history.pushState({ uploadPage: true }, '');

            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault();
                setBackWarningOpen(true);
                // Re-push state to keep user on page until they confirm
                window.history.pushState({ uploadPage: true }, '');
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [step, files.length]);

    // --- TOTP Handlers ---

    const handleOtpChange = (index: number, value: string) => {
        // Handle multi-character paste on mobile (onChange fires with all chars)
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6);
            if (digits.length > 1) {
                const newOtp = [...otp];
                digits.split('').forEach((char, i) => {
                    if (i < 6) newOtp[i] = char;
                });
                setOtp(newOtp);
                setVerifyError('');
                const focusIndex = Math.min(digits.length, 5);
                inputRefs.current[focusIndex]?.focus();
                // Auto-submit if filled
                if (newOtp.every(d => d !== '')) {
                    verifyTotp(newOtp.join(''));
                }
                return;
            }
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) return;

        if (value && index > 0) {
            const allPreviousFilled = otp.slice(0, index).every(d => d !== '');
            if (!allPreviousFilled) return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setVerifyError('');

        if (value && index < 5) {
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
        }

        // Auto-submit if filled
        if (newOtp.every(d => d !== '')) {
            verifyTotp(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
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
        setVerifyError('');

        // Artificial delay for UX
        await new Promise(r => setTimeout(r, 800));

        try {
            const response = await api.post('/totp/verify', {
                url_slug: slug,
                totp: code
            });

            setUploadToken(response.data.upload_token);
            setStep('upload');

        } catch (err: unknown) {
            console.error('Verification failed:', err);
            const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
            const detail = axiosErr.response?.data?.detail;
            const errorMessage = typeof detail === 'string' ? detail : 'Invalid code. Please try again.';

            // Check if this is a rate limit error (429) and parse seconds
            if (axiosErr.response?.status === 429 && typeof detail === 'string') {
                // Parse "Too many attempts for this slug. Blocked for Xm Ys." or "...Blocked for Xs."
                const timeMatch = detail.match(/Blocked for (?:(\d+)m\s*)?(\d+)s/);
                if (timeMatch) {
                    const minutes = parseInt(timeMatch[1] || '0', 10);
                    const seconds = parseInt(timeMatch[2] || '0', 10);
                    const totalSeconds = minutes * 60 + seconds;
                    setRateLimitSeconds(totalSeconds);
                }
            }

            setVerifyError(errorMessage);
            // Clear Inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    // --- Upload Handlers ---

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [
            ...prev,
            ...acceptedFiles.map(file => ({
                file,
                status: 'pending' as const,
                progress: 0
            }))
        ]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadSingleFile = async (fileIndex: number, signal?: AbortSignal) => {
        const fileStatus = files[fileIndex];
        if (fileStatus.status === 'success') return;

        setFiles(prev => prev.map((f, i) => i === fileIndex ? { ...f, status: 'uploading', progress: 0 } : f));

        try {
            // 1. Get Signed URL
            const linkResponse = await api.post('/url/get-upload-link', {
                file_name: fileStatus.file.name,
                file_size: fileStatus.file.size,
                mime_type: fileStatus.file.type || 'application/octet-stream',
            }, {
                headers: { 'Authorization': `Bearer ${uploadToken}` },
                signal,
            });

            const { upload_url } = linkResponse.data;

            // 2. Upload to Signed URL using axios with progress tracking
            await api.put(upload_url, fileStatus.file, {
                headers: {
                    'Content-Type': fileStatus.file.type || 'application/octet-stream',
                    // Remove Authorization header for Google/AWS signed URL to avoid 403
                    'Authorization': undefined as unknown as string,
                },
                // Explicitly transform request to remove the Auth header if using global interceptors
                transformRequest: [(data, headers) => {
                    delete headers['Authorization'];
                    return data;
                }],
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setFiles(prev => prev.map((f, i) =>
                        i === fileIndex ? { ...f, progress: percentCompleted } : f
                    ));
                },
                signal,
            });

            // 3. Success
            setFiles(prev => prev.map((f, i) => i === fileIndex ? { ...f, status: 'success', progress: 100 } : f));

        } catch (err: unknown) {
            // Don't update state if request was cancelled
            const axiosErr = err as { name?: string; code?: string; message?: string };
            if (axiosErr.name === 'CanceledError' || axiosErr.code === 'ERR_CANCELED') {
                return;
            }
            console.error(`Upload error for ${fileStatus.file.name}:`, err);
            setFiles(prev => prev.map((f, i) => i === fileIndex ? {
                ...f,
                status: 'error',
                progress: 0,
                error: axiosErr.message || 'Upload failed'
            } : f));
        }
    };

    const handleUploadAll = async () => {
        // Create new AbortController for this upload batch
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsUploading(true);

        // Filter pending files and map them to their current index
        const pendingFiles = files
            .map((f, index) => ({ ...f, originalIndex: index }))
            .filter(f => f.status !== 'success');

        // Upload in parallel, passing the abort signal
        await Promise.all(pendingFiles.map(f => uploadSingleFile(f.originalIndex, signal)));

        setIsUploading(false);
        abortControllerRef.current = null;
    };

    const handleConfirmLeave = () => {
        // Cancel any in-progress uploads
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsUploading(false);
        setBackWarningOpen(false);
        setStep('totp');
        setOtp(['', '', '', '', '', '']);
        setFiles([]);
        setUploadToken(null);
    };

    // Check completion
    useEffect(() => {
        if (files.length > 0 && !isUploading && files.every(f => f.status === 'success')) {
            // Optional: Auto-advance to success screen after short delay
            const timer = setTimeout(() => setStep('success'), 1000);
            return () => clearTimeout(timer);
        }
    }, [files, isUploading]);


    // Helpers
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon />;
        return <InsertDriveFile />;
    };

    // Check if all files are uploaded and we're transitioning to success
    const isTransitioningToSuccess = files.length > 0 && !isUploading && files.every(f => f.status === 'success');

    // Loading state while validating slug
    if (isPageLoading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default'
            }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            position: 'relative'
        }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <ThemeToggle />
            </Box>

            <Container maxWidth="sm">
                <AnimatePresence mode="wait">

                    {/* STEP 1: TOTP VERIFICATION */}
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
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10,
                                            bgcolor: 'background.paper',
                                            opacity: 0.95,
                                            gap: 2
                                        }}
                                    >
                                        <SquircleLoader size={50} color={loaderColor} />
                                        <Typography color="text.secondary">Verifying Code...</Typography>
                                    </MotionBox>
                                )}
                            </AnimatePresence>

                            <Box sx={{
                                width: { xs: 60, sm: 80 },
                                height: { xs: 60, sm: 80 },
                                borderRadius: '50%',
                                bgcolor: '#00897B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}>
                                <Lock sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                            </Box>

                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                Secure Upload
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 4 }}>
                                Enter the 6-digit code provided by the owner.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', mb: 3 }}>
                                {otp.map((digit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                    >
                                        <TextField
                                            inputRef={(el) => (inputRefs.current[index] = el)}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            disabled={isVerifying}
                                            inputProps={{
                                                maxLength: 6,
                                                style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 600 },
                                                onPaste: handlePaste,
                                            }}
                                            sx={{
                                                width: { xs: 42, sm: 50 },
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: 'background.paper',
                                                },
                                            }}
                                            error={!!verifyError}
                                        />
                                    </motion.div>
                                ))}
                            </Box>

                            <AnimatePresence>
                                {verifyError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Typography color="error" sx={{ mb: 2 }}>
                                            {rateLimitSeconds !== null && rateLimitSeconds > 0
                                                ? `Too many attempts. Try again in ${Math.floor(rateLimitSeconds / 60) > 0 ? `${Math.floor(rateLimitSeconds / 60)}m ` : ''}${rateLimitSeconds % 60}s`
                                                : verifyError
                                            }
                                        </Typography>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </MotionPaper>
                    )}

                    {/* STEP 2: UPLOAD */}
                    {step === 'upload' && (
                        <MotionPaper
                            key="upload-step"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            elevation={0}
                            sx={{
                                p: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                minHeight: 400,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ ms: 2 }}>
                                Upload Files
                            </Typography>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
                                Files will be encrypted and stored securely.
                            </Typography>

                            {/* Hide dropzone when uploading or when all files are uploaded */}
                            {!isUploading && !isTransitioningToSuccess && (
                                <Box
                                    {...getRootProps()}
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: isDragActive ? 'primary.main' : 'divider',
                                        borderRadius: 3,
                                        bgcolor: isDragActive ? 'action.hover' : 'transparent',
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        m: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                                    }}
                                >
                                    <input {...getInputProps()} />
                                    <CloudUpload sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                    <Typography fontWeight={500}>
                                        Drag & drop files here, or click to select
                                    </Typography>
                                </Box>
                            )}

                            {files.length > 0 && (
                                <Box sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    mb: 3,
                                    maxHeight: 300,
                                    mx: 2,
                                    px: 2.3,
                                    // Custom scrollbar styling
                                    '&::-webkit-scrollbar': {
                                        width: 8,
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        bgcolor: 'action.hover',
                                        borderRadius: 4,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bgcolor: '#00897B',
                                        borderRadius: 4,
                                        '&:hover': {
                                            bgcolor: '#00695C',
                                        },
                                    },
                                }}>
                                    <List disablePadding>
                                        {files.map((fileStatus, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 2,
                                                    mb: 1,
                                                    flexDirection: 'column',
                                                    alignItems: 'stretch',
                                                    p: 0,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, pr: 6 }}>
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        {fileStatus.status === 'success' ? (
                                                            <CheckCircle color="success" />
                                                        ) : fileStatus.status === 'error' ? (
                                                            <ErrorIcon color="error" />
                                                        ) : (
                                                            getFileIcon(fileStatus.file.type)
                                                        )}
                                                    </ListItemIcon>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography noWrap fontWeight={500} fontSize="0.9rem">
                                                            {fileStatus.file.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {fileStatus.status === 'success' ? 'Uploaded' :
                                                                fileStatus.status === 'error' ? 'Failed' :
                                                                    fileStatus.status === 'uploading' ? `Uploading... ${fileStatus.progress}%` :
                                                                        `${(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB`}
                                                        </Typography>
                                                    </Box>
                                                    {(fileStatus.status === 'pending' || fileStatus.status === 'error') && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeFile(index)}
                                                            sx={{ position: 'absolute', right: 8 }}
                                                        >
                                                            <Close fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                                {/* Full-width progress bar at bottom */}
                                                {fileStatus.status === 'uploading' && (
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={fileStatus.progress}
                                                        sx={{
                                                            height: 4,
                                                            bgcolor: 'action.hover',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: '#00897B',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {/* Action buttons styled like dashboard TOTP card */}
                            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 100, p: 0.5, gap: 0.5, mt: 'auto', mx: 2, mb: 1 }}>
                                <Button
                                    size="small"
                                    onClick={() => setFiles([])}
                                    disabled={isUploading || files.length === 0}
                                    sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: '0.875rem' }}
                                >
                                    Clear All
                                </Button>
                                <Button
                                    size="small"
                                    onClick={handleUploadAll}
                                    disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}
                                    startIcon={isUploading ? <SquircleLoader size={16} color="white" /> : <CloudUpload sx={{ fontSize: 18 }} />}
                                    sx={{
                                        flex: 1,
                                        borderRadius: 100,
                                        py: 0.75,
                                        fontSize: '0.875rem',
                                        bgcolor: '#00897B',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: '#00695C',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: 'action.disabledBackground',
                                            color: 'action.disabled',
                                        },
                                    }}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload All'}
                                </Button>
                            </Box>
                        </MotionPaper>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'success' && (
                        <MotionPaper
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 5 },
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                textAlign: 'center',
                            }}
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

                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                                Upload Complete!
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 4 }}>
                                {files.length} file{files.length !== 1 ? 's' : ''} uploaded successfully.
                            </Typography>

                            <Button variant="outlined" onClick={() => {
                                setStep('totp');
                                setOtp(['', '', '', '', '', '']);
                                setFiles([]);
                                setUploadToken(null);
                            }}>
                                Upload More
                            </Button>
                        </MotionPaper>
                    )}
                </AnimatePresence>
            </Container>

            {/* Back Button Warning Dialog */}
            <Dialog
                open={backWarningOpen}
                onClose={() => setBackWarningOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 400 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#FFF3E0', color: '#E65100', display: 'flex' }}>
                        <Warning />
                    </Box>
                    Leaving this page?
                </DialogTitle>
                <DialogContent sx={{ pb: 3 }}>
                    <Typography color="text.secondary">
                        You&apos;ll need to re-verify your code and any pending uploads will be lost.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5 }}>
                    <Button variant="outlined" onClick={() => setBackWarningOpen(false)} sx={{ borderRadius: 2, flex: 1 }}>
                        Stay
                    </Button>
                    <Button variant="contained" color="error" onClick={handleConfirmLeave} sx={{ borderRadius: 2, flex: 1 }}>
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
