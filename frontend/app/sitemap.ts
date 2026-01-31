// frontend/app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URL from env
    const baseUrl = 'https://flowsaas.com'; // Replace with actual domain

    // Static routes
    const routes = [
        '',
        '/tools',
        '/marketplace',
        '/login',
        '/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Fetch tools for dynamic routes
    let tools = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tools/`);
        tools = await res.json();
    } catch (e) {
        console.error('Failed to fetch tools for sitemap', e);
    }

    const toolRoutes = tools.map((tool: any) => ({
        url: `${baseUrl}/tools/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...routes, ...toolRoutes];
}
