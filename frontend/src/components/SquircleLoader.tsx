'use client';
import { Squircle } from 'ldrs/react';
import 'ldrs/react/Squircle.css';

interface SquircleLoaderProps {
    size?: number;
    color?: string;
}

export default function SquircleLoader({ size = 37, color = 'currentColor' }: SquircleLoaderProps) {
    return (
        <Squircle
            size={size.toString()}
            stroke="5"
            strokeLength="0.15"
            bgOpacity="0.1"
            speed="0.9"
            color={color}
        />
    );
}
