import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drivegate.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/setup-folder/', '/private/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
