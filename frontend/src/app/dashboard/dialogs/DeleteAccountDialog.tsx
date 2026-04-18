'use client';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { Warning } from '@mui/icons-material';

interface DeleteAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteAccountDialog({ open, onClose, onConfirm }: DeleteAccountDialogProps) {
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
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#FFF3E0', color: '#E65100', display: 'flex' }}>
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
                    onClick={onConfirm}
                    sx={{ borderRadius: 2, flex: 1, width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                >
                    Delete Account
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
