'use client';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Google, PersonAdd } from '@mui/icons-material';

interface NewUserDialogProps {
    open: boolean;
    onClose: () => void;
    onSignUp: () => void;
}

export default function NewUserDialog({ open, onClose, onSignUp }: NewUserDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    sx: { backdropFilter: 'blur(4px)' }
                },
                paper: {
                    sx: { borderRadius: 3, maxWidth: 420, m: 2, p: 1 }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    display: 'flex'
                }}>
                    <PersonAdd />
                </Box>
                It seems you&apos;re new here...
            </DialogTitle>
            <DialogContent sx={{ pb: 2, px: 3 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    It looks like you don&apos;t have an account yet. To get started, you&apos;ll need to:
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0, color: 'text.secondary' }}>
                    <li>Use the &quot;Sign up with Google&quot; button below</li>
                    <li>Grant DriveGate permission to access your Google Drive</li>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1, flexDirection: 'column', gap: 1.5 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Google />}
                    onClick={onSignUp}
                    sx={{ py: 1.5 }}
                >
                    Sign up with Google
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={onClose}
                    sx={{ color: 'text.secondary', borderColor: 'divider' }}
                >
                    I&apos;ll do it later
                </Button>
            </DialogActions>
        </Dialog>
    );
}
