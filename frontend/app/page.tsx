import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
    title: 'FlowSaaS - AI Workflow Automation & 100+ Free Developer Tools | No-Code Platform',
    description: 'Automate repetitive tasks with AI-powered workflows. Access 100+ free online tools for developers. Join 10,000+ users saving 20+ hours/week. No coding required.',
    keywords: [
        'workflow automation',
        'n8n templates',
        'no-code automation',
        'AI workflows',
        'free developer tools',
        'automation platform',
        'workflow builder',
        'business automation',
        'task automation',
        'integration platform',
        'JSON formatter',
        'XML converter',
        'data tools',
        'developer utilities',
        'flowsaas',
        'zapier alternative',
        'make alternative',
        'automation software'
    ],
    authors: [{ name: 'FlowSaaS Team' }],
    creator: 'FlowSaaS',
    publisher: 'FlowSaaS',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'FlowSaaS - AI Workflow Automation & 100+ Free Developer Tools',
        description: 'Automate repetitive tasks with AI-powered workflows. Access 100+ free online tools. Save 20+ hours/week. No coding required.',
        type: 'website',
        url: 'https://flowsaas.com',
        siteName: 'FlowSaaS',
        locale: 'en_US',
        images: [
            {
                url: 'https://flowsaas.com/og-home.png',
                width: 1200,
                height: 630,
                alt: 'FlowSaaS - Automate Your Workflows',
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FlowSaaS - AI Workflow Automation & 100+ Free Tools',
        description: 'Automate repetitive tasks with AI. Access 100+ free developer tools. Save 20+ hours/week.',
        images: ['https://flowsaas.com/og-home.png'],
        creator: '@flowsaas',
    },
    alternates: {
        canonical: 'https://flowsaas.com',
    },
    category: 'technology',
};

export default function HomePage() {
    return (
        <>
            {/* Organization Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "FlowSaaS",
                        "url": "https://flowsaas.com",
                        "logo": "https://flowsaas.com/logo.png",
                        "description": "AI-powered workflow automation platform with 100+ free developer tools",
                        "foundingDate": "2024",
                        "sameAs": [
                            "https://twitter.com/flowsaas",
                            "https://github.com/flowsaas",
                            "https://linkedin.com/company/flowsaas"
                        ],
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "contactType": "Customer Support",
                            "email": "support@flowsaas.com"
                        }
                    })
                }}
            />

            {/* WebSite Schema */}
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

            {/* Product Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "FlowSaaS",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD",
                            "description": "Free forever plan available"
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "1250",
                            "bestRating": "5",
                            "worstRating": "1"
                        },
                        "description": "Automate your workflows with AI-powered tools and access 100+ free developer utilities"
                    })
                }}
            />

            {/* FAQPage Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "What is FlowSaaS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "FlowSaaS is an AI-powered workflow automation platform that helps you automate repetitive tasks without coding. It includes 500+ pre-built workflow templates and 100+ free developer tools."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is FlowSaaS free?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes! FlowSaaS offers a free forever plan with access to basic workflows and all 100+ developer tools. No credit card required to get started."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Do I need coding skills to use FlowSaaS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "No coding skills required! FlowSaaS provides a visual workflow builder and pre-built templates that anyone can use to automate their work."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What apps can I integrate with FlowSaaS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "FlowSaaS integrates with 100+ popular apps including Slack, Gmail, Salesforce, HubSpot, GitHub, Google Sheets, Notion, and many more."
                                }
                            }
                        ]
                    })
                }}
            />

            <HomeClient />
        </>
    );
}
