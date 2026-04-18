'use client';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { Folder, Edit, OpenInNew } from '@mui/icons-material';
import { m } from 'framer-motion';
import { MotionPaper } from '@/components/motion';

interface FolderCardProps {
    folderName: string | null;
    folderId: string | null;
    email: string;
    onUpdateFolder: () => void;
}

export default function FolderCard({
    folderName, folderId, email, onUpdateFolder,
}: FolderCardProps) {
    const handleOpenFolder = () => {
        if (folderId) {
            const driveUrl = `https://drive.google.com/drive/folders/${folderId}?authuser=${encodeURIComponent(email)}`;
            window.open(driveUrl, '_blank');
        } else {
            const name = folderName || 'DriveGate Uploads';
            window.open(`https://drive.google.com/drive/search?q=${encodeURIComponent(name)}`, '_blank');
        }
    };

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <MotionPaper
                whileHover={{ y: -3 }}
                sx={{
                    p: { xs: 3, sm: 4 },
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F59E0B', color: 'white', display: 'flex' }}>
                        <Folder sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>Upload Folder</Typography>
                </Box>
                <Box sx={{
                    bgcolor: 'action.hover',
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    wordBreak: 'break-all',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 60,
                    fontWeight: 500,
                }}>
                    {folderName || 'My Drive (Root)'}
                </Box>
                <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 100, p: 0.5, gap: 0.5 }}>
                    <Tooltip title="Open folder in Google Drive" arrow>
                        <Button
                            size="small"
                            startIcon={<OpenInNew sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={handleOpenFolder}
                            sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Open
                        </Button>
                    </Tooltip>
                    <Tooltip title="Change upload folder name" arrow>
                        <Button
                            size="small"
                            startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={onUpdateFolder}
                            sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Change
                        </Button>
                    </Tooltip>
                </Box>
            </MotionPaper>
        </m.div>
    );
}
