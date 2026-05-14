'use client';
import { IconButton, Tooltip, Skeleton } from '@mui/material';
import { DarkMode, WbSunny } from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

const MotionIconButton = motion.create(IconButton);

export default function ThemeToggle() {
    const { mode, setMode, systemMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Show a skeleton placeholder during SSR/hydration to prevent layout shift
    if (!mounted) {
        return (
            <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ bgcolor: 'action.hover' }}
            />
        );
    }

    // Determine actual theme - handle 'system' mode by using systemMode
    const resolvedMode = mode === 'system' ? systemMode : mode;
    const isDark = resolvedMode === 'dark';

    return (
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <MotionIconButton
                onClick={() => setMode(isDark ? 'light' : 'dark')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                    },
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={mode}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isDark ? (
                            <WbSunny sx={{ color: '#FFA726' }} />
                        ) : (
                            <DarkMode sx={{ color: 'primary.main' }} />
                        )}
                    </motion.span>
                </AnimatePresence>
            </MotionIconButton>
        </Tooltip>
    );
}
