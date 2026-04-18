'use client';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { MotionPaper } from '@/components/motion';

interface UploadSuccessStepProps {
    fileCount: number;
    onUploadMore: () => void;
}

export default function UploadSuccessStep({ fileCount, onUploadMore }: UploadSuccessStepProps) {
    return (
        <MotionPaper
            key="success-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            elevation={0}
            sx={{
                p: { xs: 3, sm: 5 },
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
            }}
        >
            <Box sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
            }}>
                <CheckCircle sx={{ fontSize: { xs: 48, sm: 60 }, color: 'white' }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                Upload Complete!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                {fileCount} file{fileCount !== 1 ? 's' : ''} uploaded successfully.
            </Typography>

            <Button variant="outlined" onClick={onUploadMore}>
                Upload More
            </Button>
        </MotionPaper>
    );
}
