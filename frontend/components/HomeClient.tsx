"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AnimatedBackground from './AnimatedBackground';

interface WorkflowTemplate {
    id: number;
    name: string;
    description: string;
    n8n_workflow_id: string;
    is_active: boolean;
    is_free: boolean;
    credits_per_run: number;
    category: string;
    created_at: string;
}

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    tool_type: string;
    is_active: boolean;
    category: string;
}

const HomeClient = () => {
    const router = useRouter();
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetching for speed
                const [templatesRes, toolsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/templates`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tools/`)
                ]);

                if (templatesRes.ok) {
                    const data = await templatesRes.json();
                    setTemplates(data.slice(0, 6)); // Show top 6 templates
                }

                if (toolsRes.ok) {
                    const data = await toolsRes.json();
                    setTools(data); // Store all tools
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="relative min-h-screen bg-white">
            <div className="absolute inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16 max-w-7xl">

                {/* Hero Section - Zapier Style */}
                <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-20 pt-10 fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-900 mb-6 tracking-tight leading-[1.1]">
                        Automate your work
                        <br />
                        <span className="text-[#FF4F00]">without code</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl font-light leading-relaxed mx-auto">
                        Connect your favorite apps and automate repetitive tasks.
                        No coding required. Just logic.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                        <Button
                            size="lg"
                            className="bg-[#FF4F00] hover:bg-[#E64600] text-white px-10 h-14 text-lg font-semibold shadow-lg shadow-orange-500/20"
                            onClick={() => router.push('/signup')}
                        >
                            Start free with email
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 text-lg border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => router.push('/marketplace')}
                        >
                            Explore workflows
                        </Button>
                    </div>
                    <div className="mt-8 text-sm text-slate-500 font-medium tracking-wide">
                        ✓ Free forever plan  &nbsp;&nbsp;•&nbsp;&nbsp;  ✓ No credit card required  &nbsp;&nbsp;•&nbsp;&nbsp;  ✓ 100+ integrations
                    </div>
                </div>

                {/* Workflow Templates Grid */}
                <div className="mb-24">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-2 border-b border-slate-100 pb-6">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-3xl font-serif font-medium text-slate-900 mb-2">
                                Recommended for you
                            </h2>
                            <p className="text-slate-500 text-lg">
                                Start with a template from our community
                            </p>
                        </div>
                        <Button variant="link" onClick={() => router.push('/marketplace')} className="text-[#FF4F00] font-semibold text-lg hover:no-underline hover:opacity-80">
                            View all templates →
                        </Button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => router.push(`/marketplace/${template.id}`)}
                                    className="group bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4F00] opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-orange-50 rounded-lg text-[#FF4F00]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="M12 16V8" /></svg>
                                        </div>
                                        {template.is_free ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                                Free
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                                {template.credits_per_run} credits
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#FF4F00] transition-colors leading-tight">
                                        {template.name}
                                    </h3>

                                    <p className="text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-grow text-base">
                                        {template.description}
                                    </p>

                                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-500 group-hover:text-[#FF4F00] transition-colors">
                                            Try this template
                                        </span>
                                        <span className="transform group-hover:translate-x-1 transition-transform text-[#FF4F00]">
                                            →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Free Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-20 border-t border-slate-200">
                    <div>
                        <h2 className="text-4xl font-serif font-medium text-slate-900 mb-6">
                            Tools to help you build
                        </h2>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed font-light">
                            We offer 100+ free online developer tools to help you format, convert, and generate data for your workflows instantly.
                        </p>
                        <Button
                            onClick={() => router.push('/tools')}
                            size="lg"
                            className="bg-slate-900 text-white hover:bg-slate-800 px-8 h-14 rounded-full text-lg shadow-lg shadow-slate-900/10"
                        >
                            Explore Free Tools
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {tools.slice(0, 6).map((tool) => (
                            <div
                                key={tool.id}
                                onClick={() => router.push(`/tools/${tool.slug}`)}
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center hover:bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center h-36 group"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-slate-400 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform group-hover:text-[#FF4F00]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700 line-clamp-2 leading-tight">
                                    {tool.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeClient;
