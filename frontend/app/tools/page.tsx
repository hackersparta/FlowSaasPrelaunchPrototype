import { Metadata } from 'next';
import ToolsClient from '@/components/ToolsClient';

export const metadata: Metadata = {
    title: 'Free Online Developer Tools - 100+ Utilities | FlowSaaS',
    description: 'Browse our collection of 100+ completely free online tools. Converters, generators, formatters, and utilities for developers. No signup required.',
    keywords: ['developer tools', 'free online tools', 'json formatter', 'base64 converter', 'uuid generator'],
    openGraph: {
        title: 'Free Developer Tools Collection',
        description: '100+ Free Online Utilities',
        type: 'website',
        url: 'https://flowsaas.com/tools',
    }
};

export default function ToolsPage() {
    return <ToolsClient />;
}
