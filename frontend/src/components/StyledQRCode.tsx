'use client';

import React, { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Box, useTheme } from '@mui/material';

interface StyledQRCodeProps {
    value: string;
    size?: number;
    logoSrc?: string;
    logoSize?: number;
}

export default function StyledQRCode({
    value,
    size = 200,
    logoSrc = '/logo-light.svg',
    logoSize = 40
}: StyledQRCodeProps) {
    const theme = useTheme();
    const [qrData, setQrData] = useState<{ modules: boolean[][]; size: number } | null>(null);

    // Color palette matching app theme
    const primaryColor = '#0D9488';  // Teal primary
    const secondaryColor = '#115E59'; // Darker teal for gradient
    const backgroundColor = '#FFFFFF';

    const margin = 2;

    // Generate QR data
    useEffect(() => {
        const generateQR = async () => {
            if (!value) return;

            try {
                const qr = await QRCode.create(value, {
                    errorCorrectionLevel: 'M',
                });

                const modules = qr.modules;
                const moduleCount = modules.size;
                const data: boolean[][] = [];

                for (let row = 0; row < moduleCount; row++) {
                    const rowData: boolean[] = [];
                    for (let col = 0; col < moduleCount; col++) {
                        rowData.push(modules.get(row, col) === 1);
                    }
                    data.push(rowData);
                }

                setQrData({ modules: data, size: moduleCount });
            } catch (err) {
                console.error('Failed to generate QR code:', err);
            }
        };

        generateQR();
    }, [value]);

    // Generate SVG elements
    const svgContent = useMemo(() => {
        if (!qrData) return null;

        const { modules, size: moduleCount } = qrData;
        const totalModules = moduleCount + margin * 2;
        const moduleSize = size / totalModules;
        const dotRadius = moduleSize * 0.35;
        const eyeRadiusOuter = moduleSize * 2.5;
        const eyeRadiusInner = moduleSize * 1.2;

        // Helper to check if a module is part of the 3 corner "Eyes"
        const isFinderPattern = (r: number, c: number) => {
            if (r < 7 && c < 7) return true; // Top-Left
            if (r < 7 && c >= moduleCount - 7) return true; // Top-Right
            if (r >= moduleCount - 7 && c < 7) return true; // Bottom-Left
            return false;
        };

        // Generate unique gradient ID
        const gradientId = `qr-gradient-${Math.random().toString(36).substr(2, 9)}`;

        // Data modules (dots)
        const dots: React.ReactNode[] = [];
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (isFinderPattern(row, col)) continue;

                if (modules[row][col]) {
                    const x = (col + margin) * moduleSize;
                    const y = (row + margin) * moduleSize;

                    dots.push(
                        <rect
                            key={`dot-${row}-${col}`}
                            x={x}
                            y={y}
                            width={moduleSize * 0.9}
                            height={moduleSize * 0.9}
                            rx={dotRadius}
                            ry={dotRadius}
                            fill={`url(#${gradientId})`}
                        />
                    );
                }
            }
        }

        // Generate finder patterns (eyes)
        const generateEye = (startRow: number, startCol: number, key: string) => {
            const x = (startCol + margin) * moduleSize;
            const y = (startRow + margin) * moduleSize;
            const eyeSize = 7 * moduleSize;
            const innerSize = 3 * moduleSize;
            const innerOffset = 2 * moduleSize;

            return (
                <g key={key}>
                    {/* Outer ring */}
                    <rect
                        x={x + moduleSize / 2}
                        y={y + moduleSize / 2}
                        width={eyeSize - moduleSize}
                        height={eyeSize - moduleSize}
                        rx={eyeRadiusOuter}
                        ry={eyeRadiusOuter}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={moduleSize}
                    />
                    {/* Inner square */}
                    <rect
                        x={x + innerOffset}
                        y={y + innerOffset}
                        width={innerSize}
                        height={innerSize}
                        rx={eyeRadiusInner}
                        ry={eyeRadiusInner}
                        fill={`url(#${gradientId})`}
                    />
                </g>
            );
        };

        const eyes = [
            generateEye(0, 0, 'eye-tl'),
            generateEye(0, moduleCount - 7, 'eye-tr'),
            generateEye(moduleCount - 7, 0, 'eye-bl'),
        ];

        // Logo center position
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        const logoPadding = moduleSize * 0.5;
        const logoCircleRadius = (logoSize / 2) + logoPadding;

        return (
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Gradient definition */}
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={primaryColor} />
                        <stop offset="100%" stopColor={secondaryColor} />
                    </linearGradient>
                </defs>

                {/* Background */}
                <rect width={size} height={size} fill={backgroundColor} />

                {/* Data dots */}
                {dots}

                {/* Finder patterns (eyes) */}
                {eyes}

                {/* Logo background circle */}
                {logoSrc && (
                    <>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={logoCircleRadius}
                            fill={backgroundColor}
                            stroke={primaryColor}
                            strokeWidth={moduleSize * 0.5}
                        />
                        {/* Logo image */}
                        <image
                            href={logoSrc}
                            x={logoX}
                            y={logoY}
                            width={logoSize}
                            height={logoSize}
                        />
                    </>
                )}
            </svg>
        );
    }, [qrData, size, logoSize, logoSrc, primaryColor, secondaryColor, backgroundColor]);

    if (!svgContent) {
        return (
            <Box
                sx={{
                    width: size,
                    height: size,
                    bgcolor: backgroundColor,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            />
        );
    }

    return (
        <Box
            sx={{
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: backgroundColor,
                borderRadius: 3,
                p: 2,
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0,0,0,0.3)'
                    : '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'divider',
            }}
        >
            {svgContent}
        </Box>
    );
}