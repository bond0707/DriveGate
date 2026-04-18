'use client';
import { Typography, Dialog, DialogContent, Box } from '@mui/material';
import { Favorite } from '@mui/icons-material';

interface ThankYouDialogProps {
    open: boolean;
    deletedUsername: string;
}

export default function ThankYouDialog({ open, deletedUsername }: ThankYouDialogProps) {
    return (
        <Dialog
            open={open}
            slotProps={{
                paper: {
                    sx: { borderRadius: 3, maxWidth: 400, textAlign: 'center' }
                }
            }}
        >
            <DialogContent sx={{ py: 4, px: 3 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <Favorite sx={{ fontSize: 32, color: '#E53935' }} />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Thanks for using DriveGate{deletedUsername ? `, ${deletedUsername.split(' ')[0]}` : ''}!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    We&apos;re sad to see you go. Your account has been deleted.
                </Typography>
            </DialogContent>
        </Dialog>
    );
}
