'use client';
import { Box, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import SquircleLoader from '@/components/SquircleLoader';
import { MotionPaper, MotionBox } from '@/components/motion';

interface SuccessStepProps {
    loaderColor: string;
}

export default function SuccessStep({ loaderColor }: SuccessStepProps) {
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
            <MotionBox
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
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
            </MotionBox>

            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                All Set!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Two-factor authentication is enabled.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <SquircleLoader size={24} color={loaderColor} />
                <Typography variant="body2" color="text.secondary">
                    Redirecting...
                </Typography>
            </Box>
        </MotionPaper>
    );
}
