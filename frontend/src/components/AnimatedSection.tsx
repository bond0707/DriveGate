'use client';
import { motion, useScroll, useTransform, MotionProps } from 'framer-motion';
import { Box, BoxProps } from '@mui/material';
import { useRef, ReactNode } from 'react';

const MotionBox = motion.create(Box);

interface AnimatedSectionProps extends Omit<BoxProps, keyof MotionProps> {
    children: ReactNode;
    parallaxSpeed?: number; // 0 = no parallax, positive = moves slower, negative = moves faster
    fadeIn?: boolean;
    slideDirection?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
}

export default function AnimatedSection({
    children,
    parallaxSpeed = 0,
    fadeIn = true,
    slideDirection = 'up',
    delay = 0,
    ...boxProps
}: AnimatedSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [parallaxSpeed * 100, -parallaxSpeed * 100]);

    const getSlideOffset = () => {
        switch (slideDirection) {
            case 'up': return { y: 60 };
            case 'down': return { y: -60 };
            case 'left': return { x: 60 };
            case 'right': return { x: -60 };
            default: return {};
        }
    };

    const getSlideTarget = () => {
        switch (slideDirection) {
            case 'up':
            case 'down': return { y: 0 };
            case 'left':
            case 'right': return { x: 0 };
            default: return {};
        }
    };

    return (
        <MotionBox
            ref={ref}
            initial={{
                opacity: fadeIn ? 0 : 1,
                ...getSlideOffset(),
            }}
            whileInView={{
                opacity: 1,
                ...getSlideTarget(),
            }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{
                duration: 0.7,
                ease: [0.25, 0.4, 0.25, 1],
                delay,
            }}
            style={{ y: parallaxSpeed !== 0 ? y : undefined }}
            {...boxProps}
        >
            {children}
        </MotionBox>
    );
}
