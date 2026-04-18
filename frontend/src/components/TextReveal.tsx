'use client';
import { m, Variants } from 'framer-motion';
import { Typography, TypographyProps } from '@mui/material';

interface TextRevealProps extends Omit<TypographyProps, 'children'> {
    children: string;
    delay?: number;
    staggerChildren?: number;
    type?: 'word' | 'character';
}

const containerVariants: Variants = {
    hidden: {},
    visible: (custom: { delay: number; stagger: number }) => ({
        transition: {
            staggerChildren: custom.stagger,
            delayChildren: custom.delay,
        },
    }),
};

const wordVariants: Variants = {
    hidden: {
        y: '100%',
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1],
        },
    },
};

const charVariants: Variants = {
    hidden: {
        y: '100%',
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.4, 0.25, 1],
        },
    },
};

export default function TextReveal({
    children,
    delay = 0,
    staggerChildren = 0.05,
    type = 'word',
    ...typographyProps
}: TextRevealProps) {
    const elements = type === 'word' ? children.split(' ') : children.split('');
    const variants = type === 'word' ? wordVariants : charVariants;

    return (
        <Typography
            component={m.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: '-100px' }}
            custom={{ delay, stagger: staggerChildren }}
            {...typographyProps}
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                overflow: 'hidden',
                ...typographyProps.sx,
            }}
        >
            {elements.map((element, index) => (
                <m.span
                    key={index}
                    variants={variants}
                    style={{
                        display: 'inline-block',
                        overflow: 'hidden',
                        marginRight: type === 'word' ? '0.3em' : undefined,
                    }}
                >
                    <m.span style={{ display: 'inline-block' }}>
                        {element}
                    </m.span>
                </m.span>
            ))}
        </Typography>
    );
}
