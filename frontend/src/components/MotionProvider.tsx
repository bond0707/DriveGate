'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Provides framer-motion animation features via LazyMotion.
 * Uses domAnimation (basic animate/exit/variants) instead of loading all features.
 * All `m.*` and `MotionBox`/`MotionPaper` components must be inside this provider.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={domAnimation}>
            {children}
        </LazyMotion>
    );
}
