'use client';
import { Box, Typography } from '@mui/material';
import { CloudUploadRounded, SecurityRounded, HistoryEduRounded } from '@mui/icons-material';
import { m } from 'framer-motion';
import Image from 'next/image';
import { MotionBox } from '@/components/motion';

const features = [
    { icon: <SecurityRounded />, text: 'Zero-Login Guest Uploads' },
    { icon: <CloudUploadRounded />, text: 'Permanent Custom URLs' },
    { icon: <HistoryEduRounded />, text: 'Secure Write-Only Access' },
];

export default function LoginBranding() {
    return (
        <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            sx={{
                flex: 1,
                background: 'linear-gradient(135deg, #00897B 0%, #00695C 50%, #004D40 100%)',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                p: 6,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background circles */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    filter: 'blur(60px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-15%',
                    right: '-15%',
                    width: '50%',
                    height: '50%',
                    borderRadius: '50%',
                    background: 'rgba(255, 138, 101, 0.15)',
                    filter: 'blur(80px)',
                }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
                <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 4,
                        justifyContent: 'center'
                    }}>
                        <Image src="/logo-light.svg" alt="DriveGate" width={60} height={60} />
                        <Typography variant="h3" fontWeight="700">
                            DriveGate
                        </Typography>
                    </Box>
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                        The one-way entrance to your private cloud.
                    </Typography>
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Box sx={{ mt: 6 }}>
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 3,
                                    p: 2,
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                {feature.icon}
                                <Typography variant="body1">{feature.text}</Typography>
                            </Box>
                        ))}
                    </Box>
                </m.div>
            </Box>
        </MotionBox>
    );
}
