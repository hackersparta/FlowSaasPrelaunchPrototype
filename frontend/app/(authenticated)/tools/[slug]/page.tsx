import { Metadata } from 'next';
import ToolClient from '@/components/ToolClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const response = await fetch(`http://personalsaas-backend-1:8000/tools/${params.slug}`, { cache: 'no-store' });
        if (!response.ok) return { title: 'Tool Not Found' };

        const tool = await response.json();

        return {
            title: tool.seo_title || `${tool.name} - Free Online Tool | FlowSaaS`,
            description: tool.seo_description || tool.description,
            keywords: tool.seo_keywords?.split(', ') || [tool.name, 'free tool', 'online utility'],
            openGraph: {
                title: tool.seo_title || tool.name,
                description: tool.seo_description || tool.description,
                type: 'website',
                images: [`https://flowsaas.com/tools/${tool.slug}/og.png`]
            }
        };
    } catch (e) {
        return { title: 'Free Online Tool' };
    }
}

export default function ToolPage({ params }: { params: { slug: string } }) {
    return <ToolClient slug={params.slug} />;
}
