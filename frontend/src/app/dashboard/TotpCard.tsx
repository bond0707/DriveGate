'use client';
import { Box, Typography, Button, CircularProgress, Tooltip } from '@mui/material';
import { Security, QrCode2, Refresh } from '@mui/icons-material';
import { m } from 'framer-motion';
import SquircleLoader from '@/components/SquircleLoader';
import { MotionPaper } from '@/components/motion';

interface TotpCardProps {
    totpCode: string | null;
    totpProgress: number;
    totpLoading: boolean;
    isTotpEnabled: boolean;
    loaderColor: string;
    onCopyTotp: () => void;
    onRescanTotp: () => void;
    onResetTotp: () => void;
}

export default function TotpCard({
    totpCode, totpProgress, totpLoading, isTotpEnabled,
    loaderColor, onCopyTotp, onRescanTotp, onResetTotp,
}: TotpCardProps) {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
                            <Security sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600}>Time based OTP</Typography>
                    </Box>
                </Box>

                {/* TOTP Code Display */}
                {totpLoading ? (
                    <Box
                        sx={{
                            bgcolor: 'action.hover',
                            p: 2,
                            borderRadius: 2,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            minHeight: 60,
                        }}
                    >
                        <SquircleLoader size={30} color={loaderColor} />
                    </Box>
                ) : totpCode ? (
                    <Tooltip title="Click to copy" arrow>
                        <Box
                            onClick={onCopyTotp}
                            sx={{
                                bgcolor: 'action.hover',
                                p: 2,
                                borderRadius: 2,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flex: 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'action.selected' },
                                minHeight: 60,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'monospace',
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    color: 'primary.main',
                                }}
                            >
                                {totpCode.slice(0, 3)} {totpCode.slice(3)}
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={totpProgress}
                                    size={28}
                                    thickness={4}
                                    color="primary"
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0, left: 0, bottom: 0, right: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: 10 }}>
                                        {Math.round(totpProgress / (100 / 30))}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Tooltip>
                ) : (
                    <Box
                        sx={{
                            bgcolor: 'action.hover',
                            p: 2,
                            borderRadius: 2,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            minHeight: 60,
                        }}
                    >
                        <Typography color="text.secondary" variant="body2">
                            {isTotpEnabled ? 'Unable to load code' : 'TOTP not configured'}
                        </Typography>
                    </Box>
                )}

                <Box sx={{
                    display: 'flex',
                    bgcolor: 'action.hover',
                    borderRadius: 100,
                    p: 0.5,
                    gap: 0.5,
                }}>
                    <Tooltip title="Add existing code to new authenticator" arrow>
                        <Button
                            size="small"
                            startIcon={<QrCode2 sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={onRescanTotp}
                            sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Rescan
                        </Button>
                    </Tooltip>
                    <Tooltip title="Generate new code (old codes stop working)" arrow>
                        <Button
                            size="small"
                            startIcon={<Refresh sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={onResetTotp}
                            sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Reset
                        </Button>
                    </Tooltip>
                </Box>
            </MotionPaper>
        </m.div>
    );
}
