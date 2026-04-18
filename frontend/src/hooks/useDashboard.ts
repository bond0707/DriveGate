'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { generateTotp } from '@/lib/crypto';

export interface DashboardState {
    setupComplete: boolean;
    totpCode: string | null;
    totpProgress: number;
    totpLoading: boolean;
    snackbarMessage: string;
    snackbarOpen: boolean;
    deleteDialogOpen: boolean;
    thankYouDialogOpen: boolean;
    signOutDialogOpen: boolean;
    deletedUsername: string;
}

export interface DashboardActions {
    handleCopyTotp: () => void;
    handleRescanTotp: () => void;
    handleResetTotp: () => void;
    handleCopyLink: () => void;
    handleUpdateFolder: () => void;
    handleSignOut: () => void;
    handleConfirmSignOut: () => void;
    handleDeleteAccount: () => void;
    handleConfirmDelete: () => void;
    setDeleteDialogOpen: (open: boolean) => void;
    setSignOutDialogOpen: (open: boolean) => void;
    setSnackbarOpen: (open: boolean) => void;
}

/**
 * Encapsulates all Dashboard business logic:
 * - Setup pipeline (TOTP → Folder → Link)
 * - TOTP code generation
 * - Event handlers (copy, rescan, reset, delete, sign out)
 */
export function useDashboard(): DashboardState & DashboardActions {
    const router = useRouter();
    const { user, signOut, checkAuth, isLoading: authLoading } = useAuth();

    // Setup Pipeline
    const [setupComplete, setSetupComplete] = useState(false);

    // TOTP
    const [totpCode, setTotpCode] = useState<string | null>(null);
    const [totpProgress, setTotpProgress] = useState(100);
    const [totpLoading, setTotpLoading] = useState(true);

    // Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Delete Account
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false);
    const [, setIsDeleting] = useState(false);
    const [deletedUsername, setDeletedUsername] = useState('');

    // Sign Out
    const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

    // 1. Setup Pipeline
    useEffect(() => {
        const runSetupPipeline = async () => {
            if (authLoading) return;

            if (!user) {
                router.push('/login');
                return;
            }

            if (!user.totp_secret) {
                const skipTotp = localStorage.getItem('skip_totp_setup');
                if (skipTotp) {
                    localStorage.removeItem('skip_totp_setup');
                } else {
                    router.push('/setup-totp');
                    return;
                }
            }

            if (!user.folder_name) {
                const skipSetup = localStorage.getItem('skip_folder_setup');
                if (skipSetup) {
                    localStorage.removeItem('skip_folder_setup');
                    try {
                        await api.patch('/drive/folder', {
                            folder_name: 'DriveGate Uploads',
                            drive_type: 'GOOGLE_DRIVE'
                        });
                        await checkAuth();
                    } catch (e) {
                        console.error("Failed to set default folder", e);
                    }
                } else {
                    router.push('/setup-folder');
                    return;
                }
            }

            if (!user.url_slug) {
                router.push('/setup-link');
                return;
            }

            setSetupComplete(true);
        };

        runSetupPipeline();
    }, [user, authLoading, router, checkAuth]);

    // 2. TOTP Calculation
    useEffect(() => {
        if (!setupComplete || !user?.totp_secret) {
            setTotpLoading(false);
            return;
        }

        const calculateTotp = () => {
            try {
                const result = generateTotp(user.totp_secret!, user.email);
                setTotpCode(result.code);
                setTotpProgress(result.progress);
            } catch (err) {
                console.error('Failed to calculate TOTP:', err);
                setTotpCode(null);
            } finally {
                setTotpLoading(false);
            }
        };

        calculateTotp();
        const interval = setInterval(calculateTotp, 1000);
        return () => clearInterval(interval);
    }, [setupComplete, user?.totp_secret, user?.email]);

    // Handlers
    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarOpen(true);
    };

    const handleCopyTotp = () => {
        if (!totpCode) return;
        navigator.clipboard.writeText(totpCode);
        showSnackbar('Code copied!');
    };

    const handleRescanTotp = () => {
        localStorage.setItem('totp_mode', 'rescan');
        router.push('/setup-totp');
    };

    const handleResetTotp = () => {
        localStorage.setItem('totp_mode', 'reset');
        router.push('/setup-totp');
    };

    const handleCopyLink = () => {
        if (!user?.url_slug) return;
        const fullUrl = `${window.location.origin}/${user.url_slug}`;
        navigator.clipboard.writeText(fullUrl);
        showSnackbar('Link copied!');
    };

    const handleUpdateFolder = () => {
        localStorage.setItem('folder_mode', 'update');
        router.push('/setup-folder');
    };

    const handleSignOut = () => {
        setSignOutDialogOpen(true);
    };

    const handleConfirmSignOut = () => {
        setSignOutDialogOpen(false);
        signOut();
    };

    const handleDeleteAccount = () => {
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        const usernameToDelete = user?.username || '';
        try {
            await api.delete('/auth/me');
            setDeletedUsername(usernameToDelete);
            setDeleteDialogOpen(false);
            setThankYouDialogOpen(true);
            setTimeout(() => signOut(), 3000);
        } catch (error) {
            console.error("Error deleting account:", error);
            setDeleteDialogOpen(false);
            showSnackbar("Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        setupComplete,
        totpCode,
        totpProgress,
        totpLoading,
        snackbarMessage,
        snackbarOpen,
        deleteDialogOpen,
        thankYouDialogOpen,
        signOutDialogOpen,
        deletedUsername,
        handleCopyTotp,
        handleRescanTotp,
        handleResetTotp,
        handleCopyLink,
        handleUpdateFolder,
        handleSignOut,
        handleConfirmSignOut,
        handleDeleteAccount,
        handleConfirmDelete,
        setDeleteDialogOpen,
        setSignOutDialogOpen,
        setSnackbarOpen,
    };
}
