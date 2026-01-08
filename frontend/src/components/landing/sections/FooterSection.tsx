'use client';
import { Box, Container, Typography, Button } from '@mui/material';
import { GitHub } from '@mui/icons-material';

export default function FooterSection() {
    return (
        <Box
            component="footer"
            sx={{
                py: 4,
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Made with passion by
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<GitHub sx={{ fontSize: 16 }} />}
                            href="https://github.com/bond0707"
                            target="_blank"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 100,
                                px: 1.5,
                                fontSize: '0.8rem',
                            }}
                        >
                            bond0707
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                            &
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<GitHub sx={{ fontSize: 16 }} />}
                            href="https://github.com/koffandaff"
                            target="_blank"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 100,
                                px: 1.5,
                                fontSize: '0.8rem',
                            }}
                        >
                            koffandaff
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
