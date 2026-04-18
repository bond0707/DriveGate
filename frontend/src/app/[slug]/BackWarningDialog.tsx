'use client';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Warning } from '@mui/icons-material';

interface BackWarningDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirmLeave: () => void;
}

export default function BackWarningDialog({ open, onClose, onConfirmLeave }: BackWarningDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, flex: 1 }}>
                    Stay
                </Button>
                <Button variant="contained" color="error" onClick={onConfirmLeave} sx={{ borderRadius: 2, flex: 1 }}>
                    Leave
                </Button>
            </DialogActions>
        </Dialog>
    );
}
