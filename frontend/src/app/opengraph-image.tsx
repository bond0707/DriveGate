import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'DriveGate - Secure Cloud Access'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Icon could go here if we had an SVG string, for now just text */}
                    <span style={{ fontWeight: 'bold', background: 'linear-gradient(to right, #60A5FA, #3B82F6)', backgroundClip: 'text', color: 'transparent' }}>
                        DriveGate
                    </span>
                </div>
                <div style={{ fontSize: 48, marginTop: 20, color: '#94A3B8' }}>
                    Secure One-Way Cloud Access
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
