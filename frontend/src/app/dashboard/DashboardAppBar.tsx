'use client';
import {
    AppBar, Toolbar, Typography, IconButton, Avatar,
    Menu, MenuItem, Divider, useColorScheme,
} from '@mui/material';
import { Logout, AccountCircle, DeleteForever } from '@mui/icons-material';
import { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardAppBarProps {
    pictureUrl?: string | null;
    onSignOut: () => void;
    onDeleteAccount: () => void;
}

export default function DashboardAppBar({ pictureUrl, onSignOut, onDeleteAccount }: DashboardAppBarProps) {
    const { mode } = useColorScheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [pfpRetryCount, setPfpRetryCount] = useState(0);
    const [pfpKey, setPfpKey] = useState(0);
    const MAX_PFP_RETRIES = 3;

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Image src={mode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="DriveGate" width={28} height={28} style={{ marginRight: 12 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    DriveGate
                </Typography>
                <ThemeToggle />
                <IconButton size="small" onClick={handleMenu} sx={{ ml: 1 }}>
                    <Avatar
                        key={pfpKey}
                        src={pfpRetryCount >= MAX_PFP_RETRIES
                            ? undefined
                            : pictureUrl
                                ? `${pictureUrl}${pfpRetryCount > 0 ? `${pictureUrl.includes('?') ? '&' : '?'}retry=${pfpRetryCount}` : ''}`
                                : undefined
                        }
                        sx={{ width: 32, height: 32, bgcolor: 'transparent', border: '2px solid', borderColor: 'primary.main' }}
                        slotProps={{
                            img: {
                                referrerPolicy: 'no-referrer',
                                onError: () => {
                                    if (pfpRetryCount < MAX_PFP_RETRIES) {
                                        setTimeout(() => {
                                            setPfpRetryCount(prev => prev + 1);
                                            setPfpKey(prev => prev + 1);
                                        }, 1000);
                                    }
                                }
                            }
                        }}
                    >
                        <AccountCircle sx={{ color: 'primary.main', fontSize: 28 }} />
                    </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={() => { handleClose(); onSignOut(); }}>
                        <Logout sx={{ mr: 1 }} fontSize="small" />
                        Sign Out
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { handleClose(); onDeleteAccount(); }} sx={{ color: 'error.main' }}>
                        <DeleteForever sx={{ mr: 1 }} fontSize="small" />
                        Delete Account
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
