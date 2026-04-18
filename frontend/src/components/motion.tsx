'use client';

import { m } from 'framer-motion';
import { Box, Paper, IconButton } from '@mui/material';

/**
 * Shared motion-wrapped MUI components.
 * Uses `m` (minimal) instead of `motion` for LazyMotion compatibility.
 * Import from here instead of re-creating per file.
 */
export const MotionBox = m.create(Box);
export const MotionPaper = m.create(Paper);
export const MotionIconButton = m.create(IconButton);
