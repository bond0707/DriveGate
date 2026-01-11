'use client';

import { useEffect, useRef, useState } from 'react';
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);

    // Color palette matching app theme
    const primaryColor = '#0D9488';  // Teal primary
    const secondaryColor = '#115E59'; // Darker teal for gradient
    const backgroundColor = '#FFFFFF';

    // Use 2x resolution for sharp rendering
    const scale = 2;
    const canvasSize = size * scale;

    useEffect(() => {
        // Helper functions defined inside useEffect to satisfy lint rules
        const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();
        };

        const drawRoundedStroke = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.stroke();
        };

        const drawLogo = (
            ctx: CanvasRenderingContext2D,
            src: string,
            canvasSz: number,
            scaledLogoSize: number,
            modSize: number
        ): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const logoX = (canvasSz - scaledLogoSize) / 2;
                    const logoY = (canvasSz - scaledLogoSize) / 2;
                    const padding = modSize * 0.5;

                    // Draw background circle
                    ctx.beginPath();
                    ctx.arc(
                        canvasSz / 2,
                        canvasSz / 2,
                        (scaledLogoSize / 2) + padding,
                        0,
                        Math.PI * 2
                    );
                    ctx.fillStyle = backgroundColor;
                    ctx.fill();

                    // ADDED: Draw Border Stroke (Same as Primary Color)
                    ctx.lineWidth = modSize * 0.5; // Proportional thickness
                    ctx.strokeStyle = primaryColor;
                    ctx.stroke();

                    // Draw logo
                    ctx.drawImage(img, logoX, logoY, scaledLogoSize, scaledLogoSize);
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = src;
            });
        };

        const generateQR = async () => {
            const canvas = canvasRef.current;
            if (!canvas || !value) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            try {
                const qrData = await QRCode.create(value, {
                    errorCorrectionLevel: 'M',
                });

                const modules = qrData.modules;
                const moduleCount = modules.size;
                const margin = 2;
                const totalModules = moduleCount + margin * 2;
                const moduleSize = canvasSize / totalModules;

                // Styling constants
                const dotRadius = moduleSize * 0.35;
                const eyeRadiusOuter = moduleSize * 2.5;
                const eyeRadiusInner = moduleSize * 1.2;

                // Clear background
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvasSize, canvasSize);

                // Helper to check if a module is part of the 3 corner "Eyes"
                const isFinderPattern = (r: number, c: number) => {
                    if (r < 7 && c < 7) return true; // Top-Left
                    if (r < 7 && c >= moduleCount - 7) return true; // Top-Right
                    if (r >= moduleCount - 7 && c < 7) return true; // Bottom-Left
                    return false;
                };

                // 1. Draw Data Modules
                for (let row = 0; row < moduleCount; row++) {
                    for (let col = 0; col < moduleCount; col++) {
                        if (isFinderPattern(row, col)) continue;

                        const isDark = modules.get(row, col);
                        if (isDark) {
                            const x = (col + margin) * moduleSize;
                            const y = (row + margin) * moduleSize;

                            const gradient = ctx.createLinearGradient(x, y, x + moduleSize, y + moduleSize);
                            gradient.addColorStop(0, primaryColor);
                            gradient.addColorStop(1, secondaryColor);
                            ctx.fillStyle = gradient;

                            drawRoundedRect(ctx, x, y, moduleSize * 0.9, moduleSize * 0.9, dotRadius);
                        }
                    }
                }

                // 2. Draw Custom Finder Patterns (Eyes)
                const drawEye = (r: number, c: number) => {
                    const x = (c + margin) * moduleSize;
                    const y = (r + margin) * moduleSize;
                    const eyeSize = 7 * moduleSize;

                    const gradient = ctx.createLinearGradient(x, y, x + eyeSize, y + eyeSize);
                    gradient.addColorStop(0, primaryColor);
                    gradient.addColorStop(1, secondaryColor);
                    ctx.strokeStyle = gradient;
                    ctx.fillStyle = gradient;

                    ctx.lineWidth = moduleSize;
                    drawRoundedStroke(ctx, x + moduleSize / 2, y + moduleSize / 2, eyeSize - moduleSize, eyeSize - moduleSize, eyeRadiusOuter);

                    const innerSize = 3 * moduleSize;
                    const innerOffset = 2 * moduleSize;
                    drawRoundedRect(ctx, x + innerOffset, y + innerOffset, innerSize, innerSize, eyeRadiusInner);
                };

                drawEye(0, 0);
                drawEye(0, moduleCount - 7);
                drawEye(moduleCount - 7, 0);

                // 3. Draw Logo
                if (logoSrc) {
                    await drawLogo(ctx, logoSrc, canvasSize, logoSize * scale, moduleSize);
                }

                setIsLoaded(true);
            } catch (err) {
                console.error('Failed to generate QR code:', err);
            }
        };

        generateQR();
    }, [value, canvasSize, logoSrc, logoSize, primaryColor, secondaryColor, scale, backgroundColor]);

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
                opacity: isLoaded ? 1 : 0.5,
                transition: 'opacity 0.3s ease',
            }}
        >
            <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                    display: 'block',
                    borderRadius: '8px',
                    width: size,
                    height: size,
                }}
            />
        </Box>
    );
}