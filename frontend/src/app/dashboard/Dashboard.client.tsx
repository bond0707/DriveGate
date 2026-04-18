'use client';
import { Box, Container, Typography, Snackbar, useTheme } from '@mui/material';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SquircleLoader from '@/components/SquircleLoader';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

// Extracted components
import DashboardAppBar from './DashboardAppBar';
import TotpCard from './TotpCard';
import UploadLinkCard from './UploadLinkCard';
import FolderCard from './FolderCard';
import UploadBanner from './UploadBanner';
import DeleteAccountDialog from './dialogs/DeleteAccountDialog';
import SignOutDialog from './dialogs/SignOutDialog';
import ThankYouDialog from './dialogs/ThankYouDialog';

export default function DashboardClient() {
    const router = useRouter();
    const theme = useTheme();
    const { user, isLoading: authLoading } = useAuth();
    const loaderColor = theme.palette.mode === 'dark' ? '#80CBC4' : '#00897B';

    const {
        setupComplete,
        totpCode, totpProgress, totpLoading,
        snackbarMessage, snackbarOpen,
        deleteDialogOpen, thankYouDialogOpen, signOutDialogOpen,
        deletedUsername,
        handleCopyTotp, handleRescanTotp, handleResetTotp,
        handleCopyLink, handleUpdateFolder,
        handleSignOut, handleConfirmSignOut,
        handleDeleteAccount, handleConfirmDelete,
        setDeleteDialogOpen, setSignOutDialogOpen, setSnackbarOpen,
    } = useDashboard();

    // Loading State
    if (authLoading || !user || !setupComplete) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3, bgcolor: 'background.default' }}>
                <SquircleLoader size={50} color={loaderColor} />
            </Box>
        );
    }

    const isTotpEnabled = !!user.totp_secret;
    const uploadLink = user.url_slug;
    const isLinkSetup = !!uploadLink;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <DashboardAppBar
                pictureUrl={user.picture_url}
                onSignOut={handleSignOut}
                onDeleteAccount={handleDeleteAccount}
            />

            <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 6 }, mb: 4, px: { xs: 2, sm: 3 } }}>
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Hello, {user.username?.split(' ')[0]}
                    </Typography>
                </m.div>

                {/* Cards Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3 }, mt: { xs: 3, sm: 4 } }}>
                    <TotpCard
                        totpCode={totpCode}
                        totpProgress={totpProgress}
                        totpLoading={totpLoading}
                        isTotpEnabled={isTotpEnabled}
                        loaderColor={loaderColor}
                        onCopyTotp={handleCopyTotp}
                        onRescanTotp={handleRescanTotp}
                        onResetTotp={handleResetTotp}
                    />
                    <UploadLinkCard
                        uploadLink={uploadLink ?? null}
                        isLinkSetup={isLinkSetup}
                        onCopyLink={handleCopyLink}
                        onEditLink={() => router.push('/setup-link')}
                    />
                    <FolderCard
                        folderName={user.folder_name ?? null}
                        folderId={user.folder_id ?? null}
                        email={user.email}
                        onUpdateFolder={handleUpdateFolder}
                    />
                </Box>

                {/* Upload Banner */}
                {isLinkSetup && isTotpEnabled && (
                    <UploadBanner
                        onClick={() => router.push(`/${uploadLink}`)}
                    />
                )}
            </Container>

            {/* Dialogs */}
            <DeleteAccountDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />
            <SignOutDialog
                open={signOutDialogOpen}
                onClose={() => setSignOutDialogOpen(false)}
                onConfirm={handleConfirmSignOut}
            />
            <ThankYouDialog
                open={thankYouDialogOpen}
                deletedUsername={deletedUsername}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    );
}