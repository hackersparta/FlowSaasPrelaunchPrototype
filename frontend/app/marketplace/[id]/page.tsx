import { Metadata } from 'next';
import WorkflowClient from './WorkflowClient';

type Props = {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const response = await fetch(`http://personalsaas-backend-1:8000/templates/${params.id}`);
        if (!response.ok) return { title: 'Workflow Not Found' };
        const template = await response.json();

        return {
            title: template.seo_title || `${template.name} - n8n Automation Workflow | FlowSaaS`,
            description: template.seo_description || template.description,
            keywords: template.seo_keywords?.split(', ') || [template.name, 'n8n workflow', 'automation', 'productivity'],
            openGraph: {
                title: template.seo_title || template.name,
                description: template.seo_description || template.description,
                type: 'website',
            }
        };
    } catch (e) {
        return { title: 'Automation Workflow' };
    }
}

export default function TemplateDetail({ params }: Props) {
    return <WorkflowClient id={params.id} />;
}
