// frontend/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/admin/', '/credits/'],
        },
        sitemap: 'https://flowsaas.com/sitemap.xml', // Replace with actual domain
    };
}
