import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
    title: 'FlowSaaS - Automate Your Workflows Without Code | Free Online Tools',
    description: 'Access 100+ free online developer tools and premium n8n automation workflows. FlowSaaS helps you automate smarter with no-code solutions.',
    keywords: ['automation', 'n8n templates', 'no-code workflows', 'free tools', 'developer utilities', 'flowsaas'],
    openGraph: {
        title: 'FlowSaaS - Automate Your Workflows',
        description: 'Premium Automation Templates & Free Online Tools',
        type: 'website',
        url: 'https://flowsaas.com',
        siteName: 'FlowSaaS',
        images: [
            {
                url: 'https://flowsaas.com/og-home.png',
                width: 1200,
                height: 630,
            }
        ]
    }
};

export default function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "FlowSaaS",
                        "url": "https://flowsaas.com",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://flowsaas.com/tools?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    })
                }}
            />
            <HomeClient />
        </>
    );
}
