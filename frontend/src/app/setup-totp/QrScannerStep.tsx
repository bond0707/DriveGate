'use client';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Security, ContentCopy, Smartphone } from '@mui/icons-material';
import { m } from 'framer-motion';
import Button from '@mui/material/Button';
import StyledQRCode from '@/components/StyledQRCode';
import { MotionPaper, MotionBox } from '@/components/motion';

interface QrScannerStepProps {
    mode: 'first' | 'rescan' | 'reset';
    secret: string;
    provisioningUri: string;
    onNext: () => void;
    onCopySecret: () => void;
}

export default function QrScannerStep({
    mode, secret, provisioningUri, onNext, onCopySecret,
}: QrScannerStepProps) {
    return (
        <MotionPaper
            key="qr-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
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
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    borderRadius: '50%',
                    bgcolor: '#00897B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                }}>
                    <Security sx={{ fontSize: { xs: 30, sm: 40 }, color: 'white' }} />
                </Box>
            </MotionBox>

            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
                {mode === 'rescan' ? 'Add to Another Device' : mode === 'reset' ? 'Reset TOTP' : 'Setup Two-Factor Auth'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {mode === 'rescan'
                    ? 'Scan with your new authenticator app'
                    : 'Scan with Google Authenticator, Authy, etc.'
                }
            </Typography>

            <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                sx={{
                    width: 'fit-content',
                    mx: 'auto',
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {provisioningUri && (
                    <StyledQRCode value={provisioningUri} size={200} logoSize={45} />
                )}
            </MotionBox>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Or enter manually:
            </Typography>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 3,
                bgcolor: 'action.hover',
                pl: 2, pt: 2, pb: 2, pr: 1,
                borderRadius: 2,
                width: 'fit-content',
                mx: 'auto'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: { xs: 0.25, sm: 0 },
                }}>
                    <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ fontFamily: 'monospace', letterSpacing: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                        {secret.slice(0, 16)}
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ fontFamily: 'monospace', letterSpacing: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                        {secret.slice(16)}
                    </Typography>
                </Box>
                <Tooltip title="Copy Secret">
                    <IconButton size="small" onClick={onCopySecret}>
                        <ContentCopy fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={onNext}
                    startIcon={<Smartphone />}
                    sx={{ py: 1.5 }}
                >
                    I&apos;ve scanned the code
                </Button>
            </m.div>
        </MotionPaper>
    );
}
