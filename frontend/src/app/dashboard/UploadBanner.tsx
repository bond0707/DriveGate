'use client';
import { Box, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { m } from 'framer-motion';
import { MotionPaper } from '@/components/motion';

interface UploadBannerProps {
    onClick: () => void;
}

export default function UploadBanner({ onClick }: UploadBannerProps) {
    return (
        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <MotionPaper
                    whileHover={{ scale: 1.01 }}
                    onClick={onClick}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                        <CloudUpload sx={{ fontSize: { xs: 36, sm: 48 } }} />
                        <Box>
                            <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Upload Files
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Visit your public upload page
                            </Typography>
                        </Box>
                    </Box>
                </MotionPaper>
            </m.div>
        </Box>
    );
}
