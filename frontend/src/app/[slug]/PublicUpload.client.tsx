'use client';

import { Box, Container, useTheme } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import SquircleLoader from '@/components/SquircleLoader';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

// Extracted step components
import TotpVerifyStep from './TotpVerifyStep';
import UploadDropzone from './UploadDropzone';
import UploadSuccessStep from './UploadSuccessStep';
import BackWarningDialog from './BackWarningDialog';
import FolderUploadDialog from './FolderUploadDialog';

interface FileStatus {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    relativePath?: string;
}

export default function PublicUploadClient() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const theme = useTheme();
    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    // Page Loading State
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

    // Folder State
    const [defaultFolderId, setDefaultFolderId] = useState<string | null>(null);
    const [defaultFolderName, setDefaultFolderName] = useState<string>('Upload Folder');
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
    const [targetFolderName, setTargetFolderName] = useState<string>('Upload Folder');
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [hasCreatedFolder, setHasCreatedFolder] = useState(false);
    const [folderUploadDialogOpen, setFolderUploadDialogOpen] = useState(false);
    const [pendingFolderFiles, setPendingFolderFiles] = useState<FileStatus[]>([]);
    const [pendingFolderName, setPendingFolderName] = useState<string>('');
    const folderIdCacheRef = useRef<Map<string, string>>(new Map());

    // Rate Limit Countdown State
    const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // --- Effects ---

    // Validate slug exists on mount
    useEffect(() => {
        const validateSlug = async () => {
            try {
                await api.post('/url/slug/validate', { url_slug: slug });
                setIsPageLoading(false);
            } catch (err: unknown) {
                console.error('Slug validation failed:', err);
                router.replace('/?invalid_link=true');
            }
        };
        if (slug) validateSlug();
    }, [slug, router]);

    // Click-outside handler for new folder input
    useEffect(() => {
        if (!showNewFolderInput) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const folderRow = document.querySelector('[data-folder-row]');
            if (folderRow && !folderRow.contains(target) && !isCreatingFolder) {
                setShowNewFolderInput(false);
                setNewFolderName('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNewFolderInput, isCreatingFolder]);

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
                setVerifyError('');
                setRateLimitSeconds(null);
            }
            return;
        }
        const timer = setInterval(() => {
            setRateLimitSeconds(prev => {
                if (prev === null || prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [rateLimitSeconds]);

    // Handle back button warning during upload
    useEffect(() => {
        if (step === 'upload' && files.length > 0) {
            window.history.pushState({ uploadPage: true }, '');
            const handlePopState = (e: PopStateEvent) => {
                e.preventDefault();
                setBackWarningOpen(true);
                window.history.pushState({ uploadPage: true }, '');
            };
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [step, files.length]);

    // Check completion → auto-advance to success
    useEffect(() => {
        if (files.length > 0 && !isUploading && files.every(f => f.status === 'success')) {
            const timer = setTimeout(() => setStep('success'), 1000);
            return () => clearTimeout(timer);
        }
    }, [files, isUploading]);

    // --- TOTP Handlers ---

    const handleOtpChange = (index: number, value: string) => {
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
                if (newOtp.every(d => d !== '')) verifyTotp(newOtp.join(''));
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

        if (newOtp.every(d => d !== '')) verifyTotp(newOtp.join(''));
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
        if (newOtp.every(d => d !== '')) verifyTotp(newOtp.join(''));
    };

    const verifyTotp = async (code: string) => {
        setIsVerifying(true);
        setVerifyError('');
        await new Promise(r => setTimeout(r, 800));

        try {
            const response = await api.post('/totp/verify', { url_slug: slug, totp: code });
            setUploadToken(response.data.upload_token);

            try {
                const tokenPayload = JSON.parse(atob(response.data.upload_token.split('.')[1]));
                if (tokenPayload.folder_id) {
                    setDefaultFolderId(tokenPayload.folder_id);
                    setTargetFolderId(null);
                }
                if (tokenPayload.folder_name) {
                    setDefaultFolderName(tokenPayload.folder_name);
                    setTargetFolderName(tokenPayload.folder_name);
                }
            } catch {
                // Token parsing failed, keep defaults
            }

            setStep('upload');
        } catch (err: unknown) {
            console.error('Verification failed:', err);
            const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
            const status = axiosErr.response?.status;
            const detail = axiosErr.response?.data?.detail;

            if (status === 403) {
                const reAuthMessage = typeof detail === 'string'
                    ? detail
                    : 'Your upload link is temporarily unavailable. You need to sign up again to restore access.';
                setVerifyError(reAuthMessage);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            const errorMessage = typeof detail === 'string' ? detail : 'Invalid code. Please try again.';

            if (status === 429 && typeof detail === 'string') {
                const timeMatch = detail.match(/Blocked for (?:(\d+)m\s*)?(\d+)s/);
                if (timeMatch) {
                    const minutes = parseInt(timeMatch[1] || '0', 10);
                    const seconds = parseInt(timeMatch[2] || '0', 10);
                    setRateLimitSeconds(minutes * 60 + seconds);
                }
            }

            setVerifyError(errorMessage);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    // --- Upload Handlers ---

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const normalizePath = (p: string) => p.replace(/^\.?\//, '');

        const isFolderDrop = acceptedFiles.some(f => {
            const filePath = normalizePath((f as File & { path?: string }).path || '');
            return filePath.includes('/');
        });

        const newFiles: FileStatus[] = acceptedFiles.map(file => {
            const rawPath = (file as File & { path?: string }).path || '';
            const cleanPath = normalizePath(rawPath);
            return {
                file,
                status: 'pending' as const,
                progress: 0,
                relativePath: cleanPath.includes('/') ? cleanPath : undefined,
            };
        });

        if (isFolderDrop) {
            const firstPath = normalizePath((acceptedFiles[0] as File & { path?: string }).path || '');
            const rootFolderName = firstPath.split('/').filter(Boolean)[0] || 'Selected folder';
            setPendingFolderName(rootFolderName);
            setPendingFolderFiles(newFiles);
            setFolderUploadDialogOpen(true);
        } else {
            setFiles(prev => [...prev, ...newFiles]);
        }
    }, []);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const createFolder = async (folderName: string, parentFolderId?: string, signal?: AbortSignal): Promise<string> => {
        const response = await api.post('/drive/folder', {
            folder_name: folderName,
            parent_folder_id: parentFolderId || null,
        }, {
            headers: { 'Authorization': `Bearer ${uploadToken}` },
            signal,
        });
        return response.data.folder_id;
    };

    const createFolderTree = async (filesToUpload: FileStatus[], signal?: AbortSignal): Promise<Map<string, string>> => {
        const cache = folderIdCacheRef.current;
        const folderPaths = new Set<string>();
        for (const f of filesToUpload) {
            if (f.relativePath) {
                const parts = f.relativePath.split('/');
                parts.pop();
                for (let i = 1; i <= parts.length; i++) {
                    folderPaths.add(parts.slice(0, i).join('/'));
                }
            }
        }

        const sorted = Array.from(folderPaths).sort((a, b) => a.split('/').length - b.split('/').length);

        for (const path of sorted) {
            if (cache.has(path)) continue;
            const parts = path.split('/');
            const folderName = parts[parts.length - 1];
            const parentPath = parts.slice(0, -1).join('/');
            const parentId = parentPath ? cache.get(parentPath) : (targetFolderId || defaultFolderId || undefined);
            const folderId = await createFolder(folderName, parentId, signal);
            cache.set(path, folderId);
        }

        return cache;
    };

    const handleCreateNewFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreatingFolder(true);
        try {
            const parentId = targetFolderId || defaultFolderId || undefined;
            const folderId = await createFolder(newFolderName.trim(), parentId);
            setTargetFolderId(folderId);
            setTargetFolderName(newFolderName.trim());
            setNewFolderName('');
            setShowNewFolderInput(false);
            setHasCreatedFolder(true);
        } catch (err) {
            console.error('Failed to create folder:', err);
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const uploadSingleFile = async (fileIndex: number, folderMap: Map<string, string>, signal?: AbortSignal) => {
        const fileStatus = files[fileIndex];
        if (fileStatus.status === 'success') return;

        setFiles(prev => prev.map((f, i) => i === fileIndex ? { ...f, status: 'uploading', progress: 0 } : f));

        try {
            let parentFolderId: string | null = targetFolderId;
            if (fileStatus.relativePath) {
                const parts = fileStatus.relativePath.split('/');
                parts.pop();
                if (parts.length > 0) {
                    const folderPath = parts.join('/');
                    parentFolderId = folderMap.get(folderPath) || parentFolderId;
                }
            }

            const linkResponse = await api.post('/drive/upload-link', {
                file_name: fileStatus.file.name,
                mime_type: fileStatus.file.type || 'application/octet-stream',
                parent_folder_id: parentFolderId || undefined,
            }, {
                headers: { 'Authorization': `Bearer ${uploadToken}` },
                signal,
            });

            const { upload_url } = linkResponse.data;

            await api.put(upload_url, fileStatus.file, {
                headers: {
                    'Content-Type': fileStatus.file.type || 'application/octet-stream',
                    'Authorization': undefined as unknown as string,
                },
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

            setFiles(prev => prev.map((f, i) => i === fileIndex ? { ...f, status: 'success', progress: 100 } : f));
        } catch (err: unknown) {
            const axiosErr = err as { name?: string; code?: string; message?: string };
            if (axiosErr.name === 'CanceledError' || axiosErr.code === 'ERR_CANCELED') return;
            console.error(`Upload error for ${fileStatus.file.name}:`, err);
            setFiles(prev => prev.map((f, i) => i === fileIndex ? {
                ...f, status: 'error', progress: 0, error: axiosErr.message || 'Upload failed'
            } : f));
        }
    };

    const handleUploadAll = async () => {
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        setIsUploading(true);

        try {
            const folderMap = await createFolderTree(
                files.filter(f => f.status !== 'success'),
                signal
            );
            const pendingFiles = files
                .map((f, index) => ({ ...f, originalIndex: index }))
                .filter(f => f.status !== 'success');
            await Promise.all(pendingFiles.map(f => uploadSingleFile(f.originalIndex, folderMap, signal)));
        } catch (err) {
            console.error('Upload batch error:', err);
        }

        setIsUploading(false);
        abortControllerRef.current = null;
    };

    const resetState = () => {
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
        setTargetFolderId(null);
        setTargetFolderName(defaultFolderName);
        setShowNewFolderInput(false);
        setNewFolderName('');
        setHasCreatedFolder(false);
        folderIdCacheRef.current.clear();
    };

    const isTransitioningToSuccess = files.length > 0 && !isUploading && files.every(f => f.status === 'success');

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
                    {step === 'totp' && (
                        <TotpVerifyStep
                            otp={otp}
                            isVerifying={isVerifying}
                            verifyError={verifyError}
                            rateLimitSeconds={rateLimitSeconds}
                            loaderColor={loaderColor}
                            onOtpChange={handleOtpChange}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                        />
                    )}

                    {step === 'upload' && (
                        <UploadDropzone
                            files={files}
                            isUploading={isUploading}
                            isTransitioningToSuccess={isTransitioningToSuccess}
                            targetFolderName={targetFolderName}
                            showNewFolderInput={showNewFolderInput}
                            newFolderName={newFolderName}
                            isCreatingFolder={isCreatingFolder}
                            hasCreatedFolder={hasCreatedFolder}
                            onDrop={onDrop}
                            onRemoveFile={removeFile}
                            onClearAll={() => setFiles([])}
                            onUploadAll={handleUploadAll}
                            onSetShowNewFolderInput={setShowNewFolderInput}
                            onNewFolderNameChange={setNewFolderName}
                            onCreateNewFolder={handleCreateNewFolder}
                        />
                    )}

                    {step === 'success' && (
                        <UploadSuccessStep
                            fileCount={files.length}
                            onUploadMore={resetState}
                        />
                    )}
                </AnimatePresence>
            </Container>

            <BackWarningDialog
                open={backWarningOpen}
                onClose={() => setBackWarningOpen(false)}
                onConfirmLeave={resetState}
            />

            <FolderUploadDialog
                open={folderUploadDialogOpen}
                folderName={pendingFolderName}
                onCancel={() => {
                    setPendingFolderFiles([]);
                    setPendingFolderName('');
                    setFolderUploadDialogOpen(false);
                }}
                onConfirm={() => {
                    setFiles(prev => [...prev, ...pendingFolderFiles]);
                    setPendingFolderFiles([]);
                    setFolderUploadDialogOpen(false);
                }}
            />
        </Box>
    );
}
