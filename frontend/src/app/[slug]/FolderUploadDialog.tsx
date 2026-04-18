'use client';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Folder } from '@mui/icons-material';

interface FolderUploadDialogProps {
    open: boolean;
    folderName: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function FolderUploadDialog({ open, folderName, onCancel, onConfirm }: FolderUploadDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 400 } } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E8F5E9', color: '#00897B', display: 'flex' }}>
                    <Folder />
                </Box>
                Upload &ldquo;{folderName}&rdquo;?
            </DialogTitle>
            <DialogContent sx={{ pb: 3 }}>
                <DialogContentText color="text.secondary">
                    This will upload the entire &ldquo;{folderName}&rdquo; folder, including all its sub‑folders and files to your cloud drive.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0, gap: 1.5 }}>
                <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 2, flex: 1 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    sx={{
                        borderRadius: 2,
                        flex: 1,
                        bgcolor: '#00897B',
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: '#00695C' },
                    }}
                >
                    Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
}
