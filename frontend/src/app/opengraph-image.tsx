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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    {/* SVG Logo Implementation */}
                    <svg fill="#0D9488" height="150" width="150" viewBox="-107.58 -107.58 704.16 704.16">
                        <rect x="-107.58" y="-107.58" width="704.16" height="704.16" rx="352.08" fill="#ffffff" />
                        <path d="M489,241.9c0-38.5-23.9-71.8-58.3-86.3c-4.2-52-48.9-93.6-103-93.6c-14.6,0-29.1,3.1-41.6,8.3 c-27-42.7-74.9-69.8-126.9-69.8C77,0.5,10.4,66.1,10.4,146.2c0,13.5,2.1,28.1,6.2,41.6C6.2,203.4,0,222.1,0,240.9 c0,45.3,32.4,82.7,75.1,91.6c4.4,86.6,76.5,156,164.2,156c87.5,0,159.5-69.1,164.1-155.4C451.2,328.5,489,288.9,489,241.9z M239.3,448.9c-68.7,0-123.8-55.1-123.8-123.8s56.2-123.8,123.8-123.8s123.8,55.2,123.8,123.8C363.1,393.8,308,448.9,239.3,448.9z M400.4,291.5c-15.2-74.8-81.8-130.7-161.1-130.7c-79,0-145.3,55.5-160.9,129.8c-22.1-6.5-37.8-26-37.8-49.7 c0-13.5,5.2-26,14.6-35.4c5.2-6.2,7.3-14.6,4.2-21.8c-5.2-12.5-7.3-26-7.3-38.5C52.1,88,100,40.1,159.3,39.1 c43.7,0,83.2,26,99.9,65.5c3.1,5.2,15,19.6,31.2,8.3c10.9-7.6,23.9-12.5,37.5-12.5c34.3,0,62.4,28.1,62.4,61.4 c0,2.1-4.4,21.3,15.6,27c24.5,7.1,42.7,26,42.7,51C448.4,266,427.6,288.5,400.4,291.5z" fill="#0D9488" />
                        <path d="M280.9,303.3h-20.8v-48.9c0-11.4-9.4-20.8-20.8-20.8c-11.4,0-20.8,9.4-20.8,20.8v69.7c0,11.4,9.4,20.8,20.8,20.8h41.6 c10.4,0,20.8-9.4,20.8-20.8S292.4,303.3,280.9,303.3z" fill="#0D9488" />
                    </svg>
                    <span style={{ fontWeight: 'bold', marginLeft: 30, background: 'linear-gradient(to right, #60A5FA, #3B82F6)', backgroundClip: 'text', color: 'transparent' }}>
                        DriveGate
                    </span>
                </div>
                <div style={{ fontSize: 48, color: '#94A3B8' }}>
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
