'use client';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { Logout } from '@mui/icons-material';

interface SignOutDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function SignOutDialog({ open, onClose, onConfirm }: SignOutDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: { borderRadius: 3, maxWidth: 400 }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#BBDEFB', color: '#0D47A1', display: 'flex' }}>
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
                    onClick={onConfirm}
                    sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                >
                    Sign Out
                </Button>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
