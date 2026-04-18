'use client';
import { Box, Typography, Button } from '@mui/material';
import { Link as LinkIcon, ContentCopy, Edit } from '@mui/icons-material';
import { m } from 'framer-motion';
import { MotionPaper } from '@/components/motion';

interface UploadLinkCardProps {
    uploadLink: string | null;
    isLinkSetup: boolean;
    onCopyLink: () => void;
    onEditLink: () => void;
}

export default function UploadLinkCard({
    uploadLink, isLinkSetup, onCopyLink, onEditLink,
}: UploadLinkCardProps) {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#5C6BC0', color: 'white', display: 'flex' }}>
                        <LinkIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>Upload Link</Typography>
                </Box>

                {isLinkSetup ? (
                    <Box sx={{
                        bgcolor: 'action.hover',
                        p: 2,
                        borderRadius: 2,
                        mb: 2,
                        fontFamily: 'monospace',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        wordBreak: 'break-all',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 60,
                    }}>
                        /{uploadLink}
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <Typography color="text.secondary" variant="body2">No link configured</Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 100, p: 0.5, gap: 0.5 }}>
                        <Button
                            size="small"
                            startIcon={<ContentCopy sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={onCopyLink}
                            disabled={!isLinkSetup}
                            sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            Copy
                        </Button>
                        <Button
                            size="small"
                            startIcon={<Edit sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                            onClick={onEditLink}
                            sx={{ flex: 1, borderRadius: 100, py: 0.75, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                            {isLinkSetup ? "Change" : "Setup"}
                        </Button>
                    </Box>
                </Box>
            </MotionPaper>
        </m.div>
    );
}
