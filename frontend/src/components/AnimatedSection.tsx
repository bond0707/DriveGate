'use client';
import { useScroll, useTransform, MotionProps } from 'framer-motion';
import { BoxProps } from '@mui/material';
import { useRef, ReactNode } from 'react';
import { MotionBox } from '@/components/motion';

interface AnimatedSectionProps extends Omit<BoxProps, keyof MotionProps> {
    children: ReactNode;
    parallaxSpeed?: number; // 0 = no parallax, positive = moves slower, negative = moves faster
    fadeIn?: boolean;
    slideDirection?: 'up' | 'down' | 'left' | 'right' | 'none';
    delay?: number;
}

function getSlideOffset(dir: string) {
    switch (dir) {
        case 'up': return { y: 60 };
        case 'down': return { y: -60 };
        case 'left': return { x: 60 };
        case 'right': return { x: -60 };
        default: return {};
    }
}

function getSlideTarget(dir: string) {
    switch (dir) {
        case 'up':
        case 'down': return { y: 0 };
        case 'left':
        case 'right': return { x: 0 };
        default: return {};
    }
}

// Separate component for parallax to isolate useScroll hook
function ParallaxSection({
    children,
    parallaxSpeed,
    fadeIn,
    slideDirection,
    delay,
    ...boxProps
}: AnimatedSectionProps & { parallaxSpeed: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [parallaxSpeed * 100, -parallaxSpeed * 100]);

    return (
        <MotionBox
            ref={ref}
            initial={{
                opacity: fadeIn ? 0 : 1,
                ...getSlideOffset(slideDirection || 'up'),
            }}
            whileInView={{
                opacity: 1,
                ...getSlideTarget(slideDirection || 'up'),
            }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{
                duration: 0.7,
                ease: [0.25, 0.4, 0.25, 1],
                delay: delay || 0,
            }}
            style={{ y }}
            {...boxProps}
        >
            {children}
        </MotionBox>
    );
}

export default function AnimatedSection({
    children,
    parallaxSpeed = 0,
    fadeIn = true,
    slideDirection = 'up',
    delay = 0,
    ...boxProps
}: AnimatedSectionProps) {
    // Only use useScroll when parallax is needed — avoids scroll container warning
    if (parallaxSpeed !== 0) {
        return (
            <ParallaxSection
                parallaxSpeed={parallaxSpeed}
                fadeIn={fadeIn}
                slideDirection={slideDirection}
                delay={delay}
                {...boxProps}
            >
                {children}
            </ParallaxSection>
        );
    }

    return (
        <MotionBox
            initial={{
                opacity: fadeIn ? 0 : 1,
                ...getSlideOffset(slideDirection),
            }}
            whileInView={{
                opacity: 1,
                ...getSlideTarget(slideDirection),
            }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{
                duration: 0.7,
                ease: [0.25, 0.4, 0.25, 1],
                delay,
            }}
            {...boxProps}
        >
            {children}
        </MotionBox>
    );
}
